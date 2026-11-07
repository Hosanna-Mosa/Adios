import mongoose, { Schema, Document } from "mongoose";

/**
 * A reusable support reply. Staff insert it into a ticket answer; "{{name}}" in the body is
 * replaced with the customer's name when it is used.
 */
export interface ICannedReply extends Document {
  title: string;
  body: string;
  /** Free-text group, e.g. "Refunds" or "Delivery". */
  category?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CannedReplySchema = new Schema<ICannedReply>(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, trim: true, maxlength: 40 },
    createdBy: { type: String, required: true },
    createdByName: { type: String },
  },
  { timestamps: true }
);

CannedReplySchema.index({ category: 1, title: 1 });

export default mongoose.model<ICannedReply>("CannedReply", CannedReplySchema);
