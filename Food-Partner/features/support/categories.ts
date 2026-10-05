import i18n from "@/i18n";

// `value` is stored on the ticket and read by the admin support desk, whose
// icon matching keys off "BILLING", "QUALITY", etc. (admin/src/features/support).
// The first three are the customer app's values so they get the same icons;
// the last two are partner-specific and show as-is there. Only `label` is translated.
export function getPartnerSupportCategories() {
  return [
    { label: i18n.t("support.categories.orderIssue"), value: "OPERATIONAL ISSUE" },
    { label: i18n.t("support.categories.pickupDelay"), value: "DELAYED DELIVERY" },
    { label: i18n.t("support.categories.payments"), value: "BILLING ADJUSTMENT" },
    { label: i18n.t("support.categories.menuListing"), value: "MENU & LISTING" },
    { label: i18n.t("support.categories.account"), value: "ACCOUNT ACCESS" },
  ];
}

/** The label a partner sees for a stored category value; unknown values (e.g. set by staff) show as-is. */
export const categoryLabel = (value: string) =>
  getPartnerSupportCategories().find((c) => c.value === value)?.label ?? value;
