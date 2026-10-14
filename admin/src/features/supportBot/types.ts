export const BOT_CATEGORIES = ["ride", "food", "meat", "package", "helper", "payment", "general"] as const;
export type BotCategory = (typeof BOT_CATEGORIES)[number];

export interface Localized {
  en: string;
  te?: string;
  hi?: string;
}

export interface SupportIntent {
  _id: string;
  key: string;
  category: BotCategory;
  question: Localized;
  resolver: string;
  needsOrder: boolean;
  staticAnswer?: Localized;
  enabled: boolean;
  sortOrder: number;
  helpfulCount: number;
  notHelpfulCount: number;
}

export interface ResolverInfo {
  key: string;
  description: string;
}

export interface IntentForm {
  key: string;
  category: BotCategory;
  question: Required<Localized>;
  resolver: string;
  needsOrder: boolean;
  staticAnswer: Required<Localized>;
  enabled: boolean;
  sortOrder: string;
}

export const EMPTY_INTENT_FORM: IntentForm = {
  key: "",
  category: "food",
  question: { en: "", te: "", hi: "" },
  resolver: "orderStatus",
  needsOrder: true,
  staticAnswer: { en: "", te: "", hi: "" },
  enabled: true,
  sortOrder: "0",
};

export const DEFAULT_MAX_UNHELPFUL = 3;
