import mongoose, { Schema, Document } from "mongoose";

// One behaviour event reported by the customer or driver app — screens opened,
// taps, flow steps. It is our own live copy of what those apps also send to
// Firebase Analytics, which batches uploads for up to an hour; this one lands
// within seconds. Business facts (orders, payments) stay in their own models —
// a client-reported copy is only for trends, never for money.

export const ANALYTICS_APPS = ["customer", "driver"] as const;
export type AnalyticsApp = (typeof ANALYTICS_APPS)[number];

// Events are for trends, not records: 90 days is enough to compare this month
// with the last, and it stops a chatty client from growing the collection forever.
export const ANALYTICS_RETENTION_DAYS = 90;

export interface IAnalyticsEvent extends Document {
  name: string;
  app: AnalyticsApp;
  /** Absent for events fired before sign-in. */
  user?: mongoose.Types.ObjectId;
  role?: string;
  /** Groups one app run without identifying the device. */
  sessionId: string;
  platform: "android" | "ios" | "web" | "unknown";
  appVersion?: string;
  props?: Record<string, string | number | boolean>;
  /** When the event happened on the device (clamped to server time if implausible). */
  at: Date;
  createdAt: Date;
}

const AnalyticsEventSchema: Schema = new Schema(
  {
    name: { type: String, required: true, maxlength: 40 },
    app: { type: String, enum: ANALYTICS_APPS, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    role: { type: String, maxlength: 20 },
    sessionId: { type: String, required: true, maxlength: 64 },
    platform: { type: String, enum: ["android", "ios", "web", "unknown"], default: "unknown" },
    appVersion: { type: String, maxlength: 24 },
    props: { type: Schema.Types.Mixed },
    at: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// The live dashboard always filters by time window, then by app/name.
AnalyticsEventSchema.index({ at: -1, app: 1, name: 1 });
AnalyticsEventSchema.index({ user: 1, at: -1 });
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: ANALYTICS_RETENTION_DAYS * 24 * 60 * 60 });

export default mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);
