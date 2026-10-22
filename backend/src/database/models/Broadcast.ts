import mongoose, { Schema, Document } from "mongoose";

export const BROADCAST_AUDIENCES = ["users", "drivers", "partners", "everyone"] as const;
export type BroadcastAudience = (typeof BROADCAST_AUDIENCES)[number];

/** One push announcement an admin sent from the panel, kept as a history of what went to whom. */
export interface IBroadcast extends Document {
  audience: BroadcastAudience;
  title: string;
  body: string;
  /** Partner app only: the screen a tap opens (an allow-listed route). */
  screen?: string;
  sentBy: string;
  sentByName?: string;
  /** Devices the push was handed to Expo for. */
  recipients: number;
  createdAt: Date;
}

const BroadcastSchema = new Schema<IBroadcast>(
  {
    audience: { type: String, enum: BROADCAST_AUDIENCES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 60 },
    body: { type: String, required: true, trim: true, maxlength: 200 },
    screen: { type: String },
    sentBy: { type: String, required: true },
    sentByName: { type: String },
    recipients: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

BroadcastSchema.index({ createdAt: -1 });

export default mongoose.model<IBroadcast>("Broadcast", BroadcastSchema);
