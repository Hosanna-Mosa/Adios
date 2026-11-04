import mongoose, { Schema, Document } from "mongoose";

// Who on the staff side looked at a customer's order, and when. Support agents can
// open any order on the platform (GET /support/orders/:id), so this is the record
// that answers "which agent read this customer's details". Written by
// modules/support/support.orders.service.ts; read straight from the collection.

// A year covers any complaint about how a customer's data was used.
export const SUPPORT_AUDIT_RETENTION_DAYS = 365;

export type SupportAuditAction = "order.view" | "order.chat.view" | "order.search";

export interface ISupportAuditLog extends Document {
  actor: mongoose.Types.ObjectId;
  actorRole: string;
  action: SupportAuditAction;
  orderId?: string | null;
  /** Search filters, for "order.search". */
  details?: Record<string, unknown>;
  createdAt: Date;
}

const SupportAuditLogSchema: Schema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorRole: { type: String, required: true },
    action: { type: String, enum: ["order.view", "order.chat.view", "order.search"], required: true },
    orderId: { type: String, default: null },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SupportAuditLogSchema.index({ orderId: 1, createdAt: -1 });
SupportAuditLogSchema.index({ actor: 1, createdAt: -1 });
SupportAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: SUPPORT_AUDIT_RETENTION_DAYS * 24 * 60 * 60 });

export default mongoose.model<ISupportAuditLog>("SupportAuditLog", SupportAuditLogSchema);
