import mongoose, { Schema, Document } from "mongoose";

// One live email login code per address. Only an HMAC of the code is stored, never the
// code itself, and the row deletes itself once it expires.
export interface IEmailOtp extends Document {
  email: string;
  codeHash: string;
  attempts: number;
  sentAt: Date;
  expiresAt: Date;
}

const EmailOtpSchema = new Schema<IEmailOtp>({
  email: { type: String, required: true, unique: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IEmailOtp>("EmailOtp", EmailOtpSchema);
