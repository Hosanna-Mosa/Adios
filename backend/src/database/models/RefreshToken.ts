import mongoose, { Schema, Document } from "mongoose";

/**
 * One row per refresh token handed out at sign-in or by POST /auth/refresh. Only the SHA-256
 * of the token is stored, so a copy of this collection cannot be used to sign in.
 *
 * Every sign-in starts a "family"; each refresh retires the presented token (usedAt) and
 * issues the next one in the same family. A retired token that shows up again means two
 * parties hold the same token — the family is revoked and the owner has to sign in again.
 *
 * `tv` is the User.tokenVersion at issue time, so logout-all and blocking end refresh
 * sessions the same way they end access tokens. `role` is a UserRole for User accounts, or
 * restaurant_vendor / meat_vendor for Vendor / MeatCenter accounts (which have no tokenVersion).
 */
export interface IRefreshToken extends Document {
  tokenHash: string;
  familyId: string;
  subjectId: string;
  role: string;
  tv: number;
  expiresAt: Date;
  usedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt: Date;
}

const RefreshTokenSchema: Schema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    familyId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    tv: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-expire documents

export default mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
