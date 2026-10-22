import mongoose, { Schema, Document } from "mongoose";

/**
 * One admin / support action that changed something: who did it, what it was, what it was done to,
 * and the values before and after. Records are append-only — the schema refuses every update and
 * delete (the admin panel only reads them), so an action cannot be edited out of the trail.
 */
export interface IAdminAuditLog extends Document {
  actorId: string;
  actorName?: string;
  actorRole: string;
  /** "PUT /admin/drivers/:id" — the request, with ids replaced by :id. */
  action: string;
  method: string;
  path: string;
  targetType?: string;
  targetId?: string;
  /** The fields the request changed, as they were just before it. */
  before?: unknown;
  /** The same fields after the request succeeded. */
  after?: unknown;
  /** The request body with secrets removed and long values cut short. */
  request?: unknown;
  statusCode: number;
  ip?: string;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    actorId: { type: String, required: true, index: true },
    actorName: { type: String },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    targetType: { type: String, index: true },
    targetId: { type: String, index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    request: { type: Schema.Types.Mixed },
    statusCode: { type: Number, required: true },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, minimize: false }
);

AdminAuditLogSchema.index({ createdAt: -1 });

const refuse = () => {
  throw new Error("Audit log records are immutable");
};

// Only creating is allowed. Every other write path is closed here, at the model.
for (const op of ["updateOne", "updateMany", "findOneAndUpdate", "findOneAndReplace", "findOneAndDelete", "replaceOne", "deleteOne", "deleteMany"] as const) {
  AdminAuditLogSchema.pre(op as any, refuse);
}
AdminAuditLogSchema.pre("save", function () {
  if (!this.isNew) refuse();
});
AdminAuditLogSchema.pre("deleteOne", { document: true, query: false }, refuse);

export default mongoose.model<IAdminAuditLog>("AdminAuditLog", AdminAuditLogSchema);
