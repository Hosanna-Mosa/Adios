

// Module-level values shared by the parts of useSupportChat.

export interface ChatMessage {
  sender: "user" | "admin" | "system";
  time: string;
  text: string;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  title: string;
  category: string;
  status: "OPEN" | "RESOLVED" | "PENDING_RESOLVE";
  message: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

import i18n from "@/i18n";

// The `value` field is free text on the backend — these four are simply the
// ones already seeded/expected by the admin dashboard's own icon matching
// (admin/src/pages/Support.tsx keys off "BILLING", "QUALITY", etc. in the
// category string), so `value` is kept exactly as-is rather than adopting
// the mockup's own wording, which would silently break that matching for
// every ticket raised from this screen. Only `label` (what the customer
// sees) is translated. A function rather than a static array so `label` can
// call t() — see getEnabledTiers() in useRideConfirmation.shared.ts for the
// same non-hook-module pattern.
export function getSupportCategories() {
  return [
    { label: i18n.t("app.support.categories.operationalIssue"), value: "OPERATIONAL ISSUE" },
    { label: i18n.t("app.support.categories.delayedDelivery"), value: "DELAYED DELIVERY" },
    { label: i18n.t("app.support.categories.qualityControl"), value: "QUALITY CONTROL" },
    { label: i18n.t("app.support.categories.billingAdjustment"), value: "BILLING ADJUSTMENT" },
  ];
}
