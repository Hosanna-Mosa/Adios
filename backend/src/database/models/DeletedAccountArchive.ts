import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * A safety copy of a customer account, written by DELETE /users/me before the
 * account is anonymised. One row per deletion; never expires.
 *
 * `snapshot` is the gzip-compressed JSON of everything the customer had: the
 * full User document plus their orders, payments, reviews, support tickets,
 * chat messages, support-bot queries, notifications, cart and scheduled
 * delivery requests. It is compressed so a long order history can never push
 * the row past MongoDB's 16 MB document limit and block the deletion.
 * Decode one with `npx ts-node src/scripts/export-deleted-account.ts <id|phone>`.
 */
export interface IDeletedAccountArchive extends Document {
  originalUserId: Types.ObjectId;
  name?: string;
  phone?: string;
  email?: string;
  reason?: string;
  deletedAt: Date;
  counts: Record<string, number>;
  snapshot: Buffer;
}

const DeletedAccountArchiveSchema: Schema = new Schema(
  {
    originalUserId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String },
    phone: { type: String, index: true },
    email: { type: String },
    reason: { type: String },
    deletedAt: { type: Date, required: true },
    counts: { type: Schema.Types.Mixed, default: {} },
    snapshot: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDeletedAccountArchive>("DeletedAccountArchive", DeletedAccountArchiveSchema);
