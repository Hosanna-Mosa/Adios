import mongoose, { Schema, Document } from "mongoose";

export const SUPPORT_INTENT_CATEGORIES = ["ride", "food", "meat", "package", "helper", "payment", "general"] as const;
export type SupportIntentCategory = (typeof SUPPORT_INTENT_CATEGORIES)[number];

export interface ILocalized {
  en: string;
  te?: string;
  hi?: string;
}

// A predefined question in the customer app's support bot. The answer is not stored here
// (except for the "static" resolver): a worker builds it from the customer's live data by
// running the resolver named below — see modules/supportBot/resolvers.ts.
export interface ISupportIntent extends Document {
  key: string;
  category: SupportIntentCategory;
  question: ILocalized;
  resolver: string;
  needsOrder: boolean;
  staticAnswer?: ILocalized;
  enabled: boolean;
  sortOrder: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocalizedSchema = {
  en: { type: String, required: true, trim: true },
  te: { type: String, default: "", trim: true },
  hi: { type: String, default: "", trim: true },
};

const SupportIntentSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    category: { type: String, enum: SUPPORT_INTENT_CATEGORIES, required: true },
    question: { type: new Schema(LocalizedSchema, { _id: false }), required: true },
    resolver: { type: String, required: true },
    needsOrder: { type: Boolean, default: true },
    staticAnswer: {
      type: new Schema(
        { en: { type: String, default: "" }, te: { type: String, default: "" }, hi: { type: String, default: "" } },
        { _id: false }
      ),
      default: undefined,
    },
    enabled: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SupportIntentSchema.index({ enabled: 1, category: 1, sortOrder: 1 });

export default mongoose.model<ISupportIntent>("SupportIntent", SupportIntentSchema);
