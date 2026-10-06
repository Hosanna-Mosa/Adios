import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User, { UserRole } from "../../database/models/User";
import RevokedToken from "../../database/models/RevokedToken";
import { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from "../../utils/errors";
import { getJwtSecret } from "../../utils/jwtSecret";
import { isSelfSignupRole, isAdminPhone, OTP_ROLE_NOT_ALLOWED_MESSAGE, ACCOUNT_BLOCKED_MESSAGE } from "../../config/auth.config";

function buildLoginIdentifierQuery(identifier: string) {
  const trimmed = identifier.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes("@")) {
    return { email: lower };
  }

  const digits = trimmed.replace(/\D/g, "");
  const candidates = new Set<string>([trimmed]);

  if (digits) {
    candidates.add(digits);
    candidates.add(`+${digits}`);

    if (digits.length === 10) {
      candidates.add(`+91${digits}`);
      candidates.add(`91${digits}`);
    }

    if (digits.length > 10) {
      const lastTen = digits.slice(-10);
      candidates.add(lastTen);
      candidates.add(`+91${lastTen}`);
      candidates.add(`91${lastTen}`);
    }
  }

  return {
    $or: [
      { phone: { $in: Array.from(candidates) } },
      { email: lower },
    ],
  };
}

// One status and one message for every password-login failure. Distinguishing
// "no such user" from "wrong password" tells an attacker which phone numbers and
// email addresses are registered.
const INVALID_CREDENTIALS_MESSAGE = "Invalid phone number or password";

// A cost-10 bcrypt digest of 24 random bytes whose preimage was never recorded,
// so no password can ever match it. Comparing against it when the account does
// not exist keeps the failure path in the same timing band as a wrong password,
// so response latency does not leak registration status either. The cost must
// stay in step with the User model's bcrypt.genSalt(10).
const DUMMY_PASSWORD_HASH = "$2b$10$bPAxJGsgdz.EoM9tuODmYOti.AVMh.XLTXpxeeIkuU5E2yvUwxyrS";

const EMAIL_TAKEN_MESSAGE = "This email is already registered. Sign in instead, or use a different email.";

export class AuthService {
  async requestOTP(phone: string, email?: string) {
    // Checked before the OTP step so a sign-up with a taken email fails here,
    // not after the user has typed the code.
    if (email && (await User.exists({ email }))) {
      throw new AppError(409, EMAIL_TAKEN_MESSAGE);
    }

    // Dummy mode — log and return success (no SMS sent)
    console.log(`[DUMMY AUTH] OTP requested for ${phone}. Any 6-digit code will work.`);
    return { success: true, message: "OTP sent successfully" };
  }

  async verifyOTP(phone: string, _code: string, role: UserRole, name?: string, password?: string, email?: string) {
    // Dummy mode — ANY code is accepted. No DB lookup needed.
    console.log(`[DUMMY AUTH] Verifying OTP for ${phone}. Code: ${_code} — accepted.`);

    // verifyOtpSchema already rejects privileged roles; repeated here so the
    // guarantee survives a caller that reaches the service another way.
    if (!isSelfSignupRole(role)) {
      throw new ForbiddenError(OTP_ROLE_NOT_ALLOWED_MESSAGE);
    }

    let user = await User.findOne({ phone });

    // The token below is minted with the *stored* role, not the requested one,
    // so without this an OTP for the admin's phone would hand back an admin JWT
    // no matter which role the caller asked for.
    if (user && !isSelfSignupRole(user.role)) {
      throw new ForbiddenError(OTP_ROLE_NOT_ALLOWED_MESSAGE);
    }

    // A blocked account gets no new session. Without this, banning someone only
    // stopped them until they signed in again, which the OTP path lets anyone
    // holding the phone number do at will.
    if (user?.isBlocked) {
      throw new ForbiddenError(ACCOUNT_BLOCKED_MESSAGE);
    }

    if (!user) {
      if (!name) {
        return { isNewUser: true };
      }
      if (!password) {
        throw new ValidationError("Password is required for new user registration");
      }
      // Re-checked here in case the address was taken since request-otp.
      if (email && (await User.exists({ email }))) {
        throw new AppError(409, EMAIL_TAKEN_MESSAGE);
      }
      // Create new user with password
      user = new User({
        name,
        phone,
        role,
        password,
        email,
      });
      await user.save();

      // Driver record will be created on first onboarding save (getOrCreateDriver)
      console.log(`[DUMMY AUTH] New user created: ${name} (${phone}) with password and email ${email || ""}`);
    }

    const token = this.generateToken((user._id as any).toString(), user.role, user.tokenVersion ?? 0);
    return { user, token, isNewUser: false };
  }

  async loginWithPassword(phoneOrEmail: string, password: string, role: UserRole) {
    const query = {
      ...buildLoginIdentifierQuery(phoneOrEmail),
      role,
    };
    const user = await User.findOne(query);

    // Always pay the bcrypt cost, even when there is no such account, so a
    // missing user and a wrong password take the same amount of time.
    const isMatch = user?.password
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, DUMMY_PASSWORD_HASH);

    if (!user || !isMatch) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    // There is exactly one admin, and it is the seeded ADMIN_PHONE account. Any
    // other row carrying role ADMIN was not created by a supported code path, so
    // refuse it rather than mint a token for it. Checked after the bcrypt
    // compare above so the timing stays in the same band as a wrong password.
    if (user.role === UserRole.ADMIN && !isAdminPhone(user.phone)) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    // Checked only once the password has matched, so a blocked account is never
    // revealed to anyone but its owner.
    if (user.isBlocked) {
      throw new ForbiddenError(ACCOUNT_BLOCKED_MESSAGE);
    }

    const token = this.generateToken((user._id as any).toString(), user.role, user.tokenVersion ?? 0);
    return { user, token };
  }

  async logoutAll(userId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return { success: true, message: "Signed out of all devices" };
  }

  generateToken(userId: string, role: UserRole, tokenVersion = 0) {
    return jwt.sign(
      // jti gives this specific token an identity distinct from every other
      // token this account holds, so POST /auth/logout can revoke just this
      // one (see RevokedToken) instead of every device at once, the way
      // logoutAll's tokenVersion bump does.
      { userId, role, tv: tokenVersion, jti: crypto.randomUUID() },
      getJwtSecret(),
      { expiresIn: "30d" } // 30 days
    );
  }

  /** Ends one token. See RevokedToken for why this exists instead of a session table. */
  async revokeToken(jti: string, userId: string, expiresAt: Date) {
    // Logout is idempotent: calling it twice on the same token — a retry, a
    // double-tap — should not 500 on the unique index.
    await RevokedToken.updateOne(
      { jti },
      { $setOnInsert: { jti, userId, expiresAt } },
      { upsert: true }
    );
  }

  /**
   * Revokes whatever token is in an incoming Authorization header, tolerating
   * everything that can be wrong with it — missing, malformed, expired, wrong
   * signature, or minted before jti shipped and so carrying nothing to revoke.
   * Every one of those cases means the same thing for a logout call: there is
   * no live token left to protect, so let it succeed rather than error.
   */
  async revokePresentedToken(authHeader: string | undefined) {
    const token = authHeader?.split(" ")[1];
    if (!token) return;

    let payload: any;
    try {
      // verify, not decode: a forged jti must not be able to revoke someone
      // else's token, and this also naturally no-ops on an expired token,
      // since nothing further needs to happen once it can no longer be used.
      payload = jwt.verify(token, getJwtSecret());
    } catch {
      return;
    }

    const jti = payload?.jti;
    const userId = payload?.userId || payload?.id;
    const exp = payload?.exp;
    if (!jti || !userId || !exp) return;

    await this.revokeToken(jti, userId, new Date(exp * 1000));
  }
}

