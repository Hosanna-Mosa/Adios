import mongoose, { Schema, Document } from "mongoose";
import { encryptedFields } from "../plugins/encryptedFields";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: string; // 'transactional', 'promotional', 'alert'
  category: string; // 'order_status', 'chat', 'system'
  isRead: boolean;
  readAt?: Date;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true, default: "transactional" },
    category: { type: String, required: true, default: "system" },
    isRead: { type: Boolean, required: true, default: false },
    readAt: { type: Date },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index to retrieve a user's notifications efficiently, sorted by newest first
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });

// Notification text can name addresses and orders, so it is stored encrypted. `data` stays plain
// because the scheduler queries it (data.orderId).
NotificationSchema.plugin(encryptedFields, { paths: ["title", "body"] });

export default mongoose.model<INotification>("Notification", NotificationSchema);
