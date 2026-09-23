// Maps the raw ticket status/category enum values (used for filtering and styling —
// never translate the value itself) to translated display labels.
const STATUS_LABEL_KEY: Record<string, string> = {
  OPEN: "support.statusOpen",
  RESOLVED: "support.statusResolved",
  PENDING_RESOLVE: "support.statusPendingResolve",
};

const CATEGORY_LABEL_KEY: Record<string, string> = {
  "OPERATIONAL ISSUE": "support.categoryOperationalIssue",
  "DELAYED DELIVERY": "support.categoryDelayedDelivery",
  "MULTI-STOP ADJUSTMENT": "support.categoryMultiStopAdjustment",
  "QUALITY CONTROL": "support.categoryQualityControl",
};

export const ticketStatusLabel = (status: string, t: (key: string) => string): string => {
  const key = STATUS_LABEL_KEY[status];
  return key ? t(key) : status;
};

export const ticketCategoryLabel = (category: string, t: (key: string) => string): string => {
  const key = CATEGORY_LABEL_KEY[category];
  return key ? t(key) : category;
};
