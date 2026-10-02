import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  orderId: string;
  /** The id the sending client generated, echoed in the socket payload as `id`.
   * Chat history is keyed on it so a refetch dedupes against live messages. */
  clientId?: string;
  senderId: string;
  role: string;
  text: string;
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    clientId: { type: String },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    text: { type: String, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
