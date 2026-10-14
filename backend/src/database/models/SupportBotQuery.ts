import mongoose, { Schema, Document } from "mongoose";

export type SupportBotLang = "en" | "te" | "hi";

// One question a customer asked the support bot and the answer a worker built for it.
// Also the audit trail for the "did this help?" feedback and for escalations to an agent.
export interface ISupportBotQuery extends Document {
  user: mongoose.Types.ObjectId;
  intent: mongoose.Types.ObjectId;
  intentKey: string;
  question: string; // the question as the customer saw it (their language)
  order?: string | null; // Order ids are custom strings, not ObjectIds
  lang: SupportBotLang;
  status: "queued" | "done" | "failed";
  answer: string;
  helpful: boolean | null;
  ticket?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const SupportBotQuerySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    intent: { type: Schema.Types.ObjectId, ref: "SupportIntent", required: true },
    intentKey: { type: String, required: true },
    question: { type: String, default: "" },
    order: { type: String, default: null },
    lang: { type: String, enum: ["en", "te", "hi"], default: "en" },
    status: { type: String, enum: ["queued", "done", "failed"], default: "queued" },
    answer: { type: String, default: "" },
    helpful: { type: Boolean, default: null },
    ticket: { type: Schema.Types.ObjectId, ref: "SupportTicket", default: null },
  },
  { timestamps: true }
);

SupportBotQuerySchema.index({ user: 1, createdAt: -1 });
// Short-lived: only needed for the live answer, the limit window and escalation context.
SupportBotQuerySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.model<ISupportBotQuery>("SupportBotQuery", SupportBotQuerySchema);
