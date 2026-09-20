import mongoose, { Schema, Document } from "mongoose";

/**
 * One row per token that POST /auth/logout has explicitly ended. There is no
 * server-side session table — a JWT is valid on its signature and expiry
 * alone — so this is the only place "this specific token was logged out"
 * exists. Looked up by jti in authenticateToken and the socket handshake.
 *
 * expiresAt is copied from the token's own `exp` claim, not a fixed TTL, so a
 * row never outlives the token it revokes: once the token would have expired
 * anyway, Mongo drops the row and the collection stays bounded by "tokens
 * logged out in the last 30 days," not "tokens logged out ever."
 */
export interface IRevokedToken extends Document {
  jti: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

const RevokedTokenSchema: Schema = new Schema(
  {
    jti: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RevokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-expire documents

export default mongoose.model<IRevokedToken>("RevokedToken", RevokedTokenSchema);
