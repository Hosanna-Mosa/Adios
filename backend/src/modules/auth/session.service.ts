import crypto from "crypto";
import { Request } from "express";
import mongoose from "mongoose";
import User, { UserRole } from "../../database/models/User";
import Vendor from "../../database/models/Vendor";
import MeatCenter from "../../database/models/MeatCenter";
import RefreshToken from "../../database/models/RefreshToken";
import generateToken from "../../utils/generateToken";
import { UnauthorizedError, AppError } from "../../utils/errors";
import { isAdminPhone, ACCOUNT_BLOCKED_MESSAGE } from "../../config/auth.config";
import { getVendorAccessBlock } from "../vendors/vendor-verification.service";
import { AuthService } from "./auth.service";

/**
 * Short access token + rotating refresh token.
 *
 * A client opts in by sending `x-auth-refresh: 1` with its sign-in request. Builds that do
 * not send it keep getting the single long-lived token they were written for, so shipping
 * this does not sign out apps that are already installed. Once those builds are retired,
 * drop the opt-in check and the 30-day default.
 */

export const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 30;
// A refresh whose response was lost makes the client retry with a token that was just retired.
// Inside this window that is told to retry later; after it, it is treated as a stolen token.
const REUSE_GRACE_MS = 10 * 1000;

const authService = new AuthService();

export interface Subject {
  subjectId: string;
  /** A UserRole, or "restaurant_vendor" / "meat_vendor". */
  role: string;
  tokenVersion?: number;
}

export const clientSupportsRefresh = (req: Request): boolean => req.get("x-auth-refresh") === "1";

const hash = (raw: string) => crypto.createHash("sha256").update(raw).digest("hex");
const isUserRole = (role: string) => (Object.values(UserRole) as string[]).includes(role);

/** Signs the short-lived access token for an account. */
export function signAccessToken(subject: Subject, expiresIn = ACCESS_TOKEN_TTL): string {
  return isUserRole(subject.role)
    ? authService.generateToken(subject.subjectId, subject.role as UserRole, subject.tokenVersion ?? 0, expiresIn)
    : generateToken(subject.subjectId, subject.role, expiresIn);
}

async function createRefreshToken(subject: Subject, familyId: string): Promise<string> {
  const raw = crypto.randomBytes(48).toString("base64url");
  await RefreshToken.create({
    tokenHash: hash(raw),
    familyId,
    subjectId: subject.subjectId,
    role: subject.role,
    tv: subject.tokenVersion ?? 0,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
  });
  return raw;
}

/** Starts a new session: the short access token plus the first refresh token of a new family. */
export async function startSession(subject: Subject): Promise<{ token: string; refreshToken: string }> {
  const refreshToken = await createRefreshToken(subject, crypto.randomUUID());
  return { token: signAccessToken(subject), refreshToken };
}

/** Whether the account behind a refresh token may still hold a session. Throws if not. */
async function resolveSubject(record: { subjectId: string; role: string; tv: number }): Promise<Subject> {
  const invalid = () => new UnauthorizedError("Session no longer valid");

  if (isUserRole(record.role)) {
    if (!mongoose.Types.ObjectId.isValid(record.subjectId)) throw invalid();
    const user = await User.findById(record.subjectId).select("role phone tokenVersion isBlocked").lean();
    if (!user || (record.tv ?? 0) !== (user.tokenVersion ?? 0)) throw invalid();
    if (user.isBlocked) throw new UnauthorizedError(ACCOUNT_BLOCKED_MESSAGE);
    // Same rule as password sign-in: the only admin is the seeded ADMIN_PHONE account.
    if (user.role === UserRole.ADMIN && !isAdminPhone(user.phone)) throw invalid();
    return { subjectId: record.subjectId, role: user.role, tokenVersion: user.tokenVersion ?? 0 };
  }

  if (record.role === "meat_vendor") {
    // Legacy meat centres have their own collection; newer ones are Vendors with partnerType "meat".
    const center = await MeatCenter.exists({ _id: record.subjectId });
    if (center) return { subjectId: record.subjectId, role: "meat_vendor" };
  }

  const vendor = mongoose.Types.ObjectId.isValid(record.subjectId) ? await Vendor.findById(record.subjectId) : null;
  if (!vendor || getVendorAccessBlock(vendor)) throw invalid();
  return { subjectId: record.subjectId, role: record.role };
}

/**
 * Trades a refresh token for a new access token and the next refresh token.
 * The presented token is retired, so it works exactly once.
 */
export async function refreshSession(rawToken: unknown): Promise<{ token: string; refreshToken: string }> {
  if (typeof rawToken !== "string" || rawToken.length < 20 || rawToken.length > 200) {
    throw new UnauthorizedError("Session no longer valid");
  }

  const record = await RefreshToken.findOne({ tokenHash: hash(rawToken) });
  if (!record || record.revokedAt || record.expiresAt.getTime() <= Date.now()) {
    throw new UnauthorizedError("Session no longer valid");
  }

  // Claim the token. Only one of two simultaneous requests can flip usedAt from null.
  const claimed = await RefreshToken.findOneAndUpdate(
    { _id: record._id, usedAt: null },
    { $set: { usedAt: new Date() } }
  );

  if (!claimed) {
    const retiredAt = record.usedAt?.getTime() ?? 0;
    if (Date.now() - retiredAt <= REUSE_GRACE_MS) {
      throw new AppError(409, "Session refresh already in progress, try again");
    }
    // A retired token came back after the grace window: someone else has a copy.
    await RefreshToken.updateMany({ familyId: record.familyId, revokedAt: null }, { $set: { revokedAt: new Date() } });
    throw new UnauthorizedError("Session no longer valid");
  }

  const subject = await resolveSubject(record);
  const refreshToken = await createRefreshToken(subject, record.familyId);
  return { token: signAccessToken(subject), refreshToken };
}

/** Ends the whole session family a refresh token belongs to. Never throws on a bad token. */
export async function revokeRefreshSession(rawToken: unknown): Promise<void> {
  if (typeof rawToken !== "string" || !rawToken) return;
  const record = await RefreshToken.findOne({ tokenHash: hash(rawToken) }).select("familyId").lean();
  if (!record) return;
  await RefreshToken.updateMany({ familyId: record.familyId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

/** Ends every refresh session an account has (logout-all). */
export async function revokeAllRefreshSessions(subjectId: string): Promise<void> {
  await RefreshToken.updateMany({ subjectId, revokedAt: null }, { $set: { revokedAt: new Date() } });
}
