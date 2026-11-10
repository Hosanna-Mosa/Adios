import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User, { UserRole } from "../../database/models/User";
import Driver, { DriverStatus } from "../../database/models/Driver";
import RevokedToken from "../../database/models/RevokedToken";
import EmailOtp from "../../database/models/EmailOtp";
import { sendEmail } from "../../services/email.service";
import { AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError } from "../../utils/errors";
import { getJwtSecret } from "../../utils/jwtSecret";
import {
  isSelfSignupRole,
  isAdminPhone,
  isDummyOtpEnabled,
  OTP_ROLE_NOT_ALLOWED_MESSAGE,
  OTP_UNAVAILABLE_MESSAGE,
  ACCOUNT_BLOCKED_MESSAGE,
} from "../../config/auth.config";
import { deleteOwnAccount } from "../users/account-deletion.service";
import { deleteOwnPartnerAccount, findPartnerBySignIn } from "../vendors/partner-account-deletion.service";
import { maskPhone } from "../../utils/logMask";

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

/** Roles that sign in to the admin panel; their sessions are kept short (generateToken). */
const STAFF_SESSION_ROLES: readonly UserRole[] = [UserRole.ADMIN, UserRole.SUPPORT];

// A cost-10 bcrypt digest of 24 random bytes whose preimage was never recorded,
// so no password can ever match it. Comparing against it when the account does
// not exist keeps the failure path in the same timing band as a wrong password,
// so response latency does not leak registration status either. The cost must
// stay in step with the User model's bcrypt.genSalt(10).
const DUMMY_PASSWORD_HASH = "$2b$10$bPAxJGsgdz.EoM9tuODmYOti.AVMh.XLTXpxeeIkuU5E2yvUwxyrS";

const EMAIL_TAKEN_MESSAGE = "This email is already registered. Sign in instead, or use a different email.";

/**
 * A new sign-in starts a driver offline. The app takes the server's shift status
 * as the truth on startup, so a driver who uninstalled while online (the server
 * never heard them go offline) came back "online" on the fresh install and kept
 * getting jobs they hadn't chosen to take.
 */
async function startDriverSessionOffline(user: { _id: unknown; role: UserRole }) {
  if (user.role !== UserRole.DRIVER) return;
  const driver = await Driver.findOneAndUpdate(
    { user: String(user._id) },
    { $set: { status: DriverStatus.OFFLINE, isAvailable: false } },
    { projection: { _id: 1 } },
  ).lean();
  if (driver) {
    const { markDriverOffline } = await import("../../database/models/DriverOnlineSession");
    await markDriverOffline(driver._id).catch((err) => console.warn("[auth] Could not close online time:", err?.message));
  }
}

// ── Email login codes and sign-up tickets ──────────────────────────────────────────
const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
const EMAIL_OTP_RESEND_MS = 30 * 1000;
const EMAIL_OTP_MAX_ATTEMPTS = 5;
const SIGNUP_TICKET_TTL = "15m";
const PHONE_TAKEN_MESSAGE = "This phone number is already registered. Sign in with it instead.";

function hashEmailCode(email: string, code: string) {
  return crypto.createHmac("sha256", getJwtSecret()).update(`${email}:${code}`).digest("hex");
}

// A different key from the access tokens, so a sign-up ticket can never pass as a session.
const ticketSecret = () => `${getJwtSecret()}:signup-ticket`;

/** Proof that a phone or an email was just verified, spent by completeSignup. */
function signSignupTicket(identity: { phone?: string; email?: string }) {
  return jwt.sign({ purpose: "signup", ...identity }, ticketSecret(), { expiresIn: SIGNUP_TICKET_TTL });
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return local ? local.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 60) : "Customer";
}

export class AuthService {
  async requestOTP(phone: string, email?: string) {
    // No SMS provider is wired up yet, so outside dev there is no OTP to send.
    if (!isDummyOtpEnabled()) {
      throw new AppError(503, OTP_UNAVAILABLE_MESSAGE);
    }

    // Checked before the OTP step so a sign-up with a taken email fails here,
    // not after the user has typed the code.
    if (email && (await User.exists({ email }))) {
      throw new AppError(409, EMAIL_TAKEN_MESSAGE);
    }

    // Dummy mode — log and return success (no SMS sent)
    console.log(`[DUMMY AUTH] OTP requested for ${maskPhone(phone)}. Any 6-digit code will work.`);
    return { success: true, message: "OTP sent successfully" };
  }

  async verifyOTP(phone: string, _code: string, role: UserRole, name?: string, password?: string, email?: string, accessTtl = "30d") {
    // Gated separately from requestOTP: a caller can post here without ever
    // asking for a code, and this is the step that mints the session.
    if (!isDummyOtpEnabled()) {
      throw new AppError(503, OTP_UNAVAILABLE_MESSAGE);
    }

    // Dummy mode — ANY code is accepted. No DB lookup needed.
    console.log(`[DUMMY AUTH] Verifying OTP for ${maskPhone(phone)} — accepted.`);

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
        // Nothing is created yet. The ticket proves this phone was verified, so the
        // name screen can finish the sign-up without asking for a code again.
        return { isNewUser: true, ticket: signSignupTicket({ phone }) };
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
      console.log(`[DUMMY AUTH] New user created: ${user._id} (${maskPhone(phone)})`);
    }

    await startDriverSessionOffline(user);
    const token = this.generateToken((user._id as any).toString(), user.role, user.tokenVersion ?? 0, accessTtl);
    return { user, token, isNewUser: false };
  }

  /** Emails a 6-digit login code. Answers the same whether or not the address has an account. */
  async requestEmailOTP(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    const existing = await EmailOtp.findOne({ email });
    if (existing && Date.now() - existing.sentAt.getTime() < EMAIL_OTP_RESEND_MS) {
      throw new AppError(429, "Please wait a few seconds before asking for another code.");
    }

    const code = String(crypto.randomInt(100000, 1000000));
    await EmailOtp.findOneAndUpdate(
      { email },
      { codeHash: hashEmailCode(email, code), attempts: 0, sentAt: new Date(), expiresAt: new Date(Date.now() + EMAIL_OTP_TTL_MS) },
      { upsert: true }
    );

    try {
      await sendEmail({
        to: email,
        subject: `${code} is your Adios verification code`,
        text: `Your Adios verification code is ${code}. It expires in 10 minutes. If you didn't ask for it, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:28px 24px;background:#fcf6f6;border-radius:16px;text-align:center">
          <h1 style="color:#990039;font-size:22px;margin:0 0 8px">Your verification code</h1>
          <p style="color:#667085;font-size:14px;margin:0 0 20px">Enter this code in the Adios app to continue.</p>
          <div style="font-size:34px;font-weight:700;letter-spacing:8px;color:#171717;background:#fff;border:1px solid #e8e5e7;border-radius:12px;padding:14px 0">${code}</div>
          <p style="color:#667085;font-size:12px;margin:20px 0 0">It expires in 10 minutes. If you didn't ask for it, you can ignore this email.</p>
        </div>`,
      });
    } catch (err) {
      await EmailOtp.deleteOne({ email });
      console.error("[AUTH] Could not send email OTP:", err);
      throw new AppError(502, "We couldn't send the code right now. Please try again in a moment.");
    }
    return { success: true, message: "Verification code sent to your email" };
  }

  /** Checks an emailed code. An existing account gets a session; a new address gets a sign-up ticket. */
  async verifyEmailOTP(rawEmail: string, code: string, accessTtl = "30d") {
    const email = rawEmail.trim().toLowerCase();

    // Counted before the compare, so every guess spends an attempt even if requests race.
    const record = await EmailOtp.findOneAndUpdate({ email }, { $inc: { attempts: 1 } }, { new: true });
    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new ValidationError("That code has expired. Ask for a new one.");
    }
    if (record.attempts > EMAIL_OTP_MAX_ATTEMPTS) {
      await EmailOtp.deleteOne({ email });
      throw new AppError(429, "Too many wrong codes. Ask for a new one.");
    }
    const expected = Buffer.from(record.codeHash);
    const given = Buffer.from(hashEmailCode(email, code));
    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
      throw new ValidationError("That code didn't work. Check it and try again.");
    }
    await EmailOtp.deleteOne({ email });

    const user = await User.findOne({ email });
    if (!user) {
      return { isNewUser: true, ticket: signSignupTicket({ email }) };
    }
    if (!isSelfSignupRole(user.role)) {
      throw new ForbiddenError(OTP_ROLE_NOT_ALLOWED_MESSAGE);
    }
    if (user.isBlocked) {
      throw new ForbiddenError(ACCOUNT_BLOCKED_MESSAGE);
    }
    const token = this.generateToken((user._id as any).toString(), user.role, user.tokenVersion ?? 0, accessTtl);
    return { user, token, isNewUser: false };
  }

  /**
   * Finishes a sign-up from a ticket. A phone ticket (verified by SMS code) supplies the phone
   * and needs a name; an email ticket (verified by emailed code) supplies the email and needs
   * a phone number.
   */
  async completeSignup(ticket: string, input: { name?: string; phone?: string }, accessTtl = "30d") {
    let identity: { phone?: string; email?: string };
    try {
      const payload: any = jwt.verify(ticket, ticketSecret());
      if (payload?.purpose !== "signup") throw new Error("wrong purpose");
      identity = { phone: payload.phone, email: payload.email };
    } catch {
      throw new ValidationError("Your sign-up session expired. Please start again.");
    }

    let phone: string;
    let email: string | undefined;
    let name: string;

    if (identity.phone) {
      phone = identity.phone;
      name = (input.name ?? "").trim();
      if (!name) throw new ValidationError("Please enter your name");
      if (name.length > 60) throw new ValidationError("Name must be 60 characters or fewer");
    } else if (identity.email) {
      email = identity.email;
      phone = (input.phone ?? "").replace(/\D/g, "");
      if (phone.length === 12 && phone.startsWith("91")) phone = phone.slice(2);
      if (phone.length !== 10) throw new ValidationError("Enter a valid 10-digit phone number");
      name = nameFromEmail(email);
    } else {
      throw new ValidationError("Your sign-up session expired. Please start again.");
    }

    if (email && (await User.exists({ email }))) throw new AppError(409, EMAIL_TAKEN_MESSAGE);
    if (await User.exists(buildLoginIdentifierQuery(phone))) throw new AppError(409, PHONE_TAKEN_MESSAGE);

    const user = new User({ name, phone, email, role: UserRole.USER });
    await user.save();
    const token = this.generateToken((user._id as any).toString(), user.role, user.tokenVersion ?? 0, accessTtl);
    return { user, token, isNewUser: false };
  }

  /** Customer sign-up without OTP: creates a USER account and signs it in. */
  async register(name: string, phone: string, password: string, email?: string) {
    if (await User.exists(buildLoginIdentifierQuery(phone))) {
      throw new AppError(409, "This phone number is already registered. Sign in instead.");
    }
    if (email && (await User.exists({ email }))) {
      throw new AppError(409, EMAIL_TAKEN_MESSAGE);
    }

    const user = new User({ name, phone, email, password, role: UserRole.USER });
    await user.save();

    const token = this.generateToken((user._id as any).toString(), user.role, user.tokenVersion ?? 0);
    return { user, token };
  }

  async loginWithPassword(phoneOrEmail: string, password: string, role: UserRole, accessTtl = "30d") {
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

    await startDriverSessionOffline(user);
    const token = this.generateToken((user._id as any).toString(), user.role, user.tokenVersion ?? 0, accessTtl);
    return { user, token };
  }

  /**
   * The web deletion request: proves ownership with the same credentials as
   * sign-in, then anonymises the account. Fails the same way, and in the same
   * time, for an unknown account as for a wrong password (see loginWithPassword).
   */
  async deleteAccountWithPassword(phoneOrEmail: string, password: string, role: UserRole | "PARTNER") {
    if (role === "PARTNER") {
      // Restaurant and meat-centre partners: their own collections, their own sign-in.
      const found = await findPartnerBySignIn(phoneOrEmail);
      const isMatch = found?.outlet.password
        ? await found.outlet.matchPassword(password)
        : await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      if (!found || !isMatch || found.outlet.deletedAt) {
        throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
      }
      return deleteOwnPartnerAccount(String(found.outlet._id), found.role, password);
    }

    const user = await User.findOne({ ...buildLoginIdentifierQuery(phoneOrEmail), role });
    const isMatch = user?.password
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    if (!user || !isMatch || user.deletedAt) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }
    return deleteOwnAccount(String(user._id), password);
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

  generateToken(userId: string, role: UserRole, tokenVersion = 0, expiresIn = "30d") {
    return jwt.sign(
      // jti gives this specific token an identity distinct from every other
      // token this account holds, so POST /auth/logout can revoke just this
      // one (see RevokedToken) instead of every device at once, the way
      // logoutAll's tokenVersion bump does.
      { userId, role, tv: tokenVersion, jti: crypto.randomUUID() },
      getJwtSecret(),
      // Staff sessions live in the admin panel's localStorage and can do far more
      // with a leaked token, so they end after a working day. App sessions stay long
      // (30 days unless the client signs in with a refresh token and gets a shorter one).
      { expiresIn: (STAFF_SESSION_ROLES.includes(role) && expiresIn === "30d" ? "12h" : expiresIn) as jwt.SignOptions["expiresIn"] }
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

