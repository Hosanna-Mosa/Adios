import i18n from "@/i18n";
import type { PartnerType } from "./types";

/** Stable English values submitted to the backend (day names, cuisine tags).
 * Never translate these directly — only their *displayed* labels, via the
 * lookup helpers below. */
export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const CUISINE_OPTIONS = [
  "North Indian",
  "South Indian",
  "Chinese",
  "Italian",
  "Bakery",
  "Fast Food",
  "Street Food",
  "Continental",
  "Mexican",
  "Japanese",
  "Thai",
  "Healthy",
  "Desserts",
  "Beverages",
  "Mughlai",
] as const;

export const MEAT_CATEGORY_OPTIONS = [
  "Chicken",
  "Mutton",
  "Fish",
  "Prawns",
  "Eggs",
  "Ready to Cook",
] as const;

// Internal spreadsheet column identifiers read by parseCsvRows/parseXlsxRows
// — data-shape keys, not user-facing text.
export const MENU_UPLOAD_COLUMNS = [
  "category",
  "itemName",
  "price",
  "description",
  "type",
  "isBestseller",
];
export const MENU_TEMPLATE_FILE = "/menu_items_reference_template.xlsx";

const DAY_LABEL_KEY: Record<string, string> = {
  Monday: "onboarding.days.monday",
  Tuesday: "onboarding.days.tuesday",
  Wednesday: "onboarding.days.wednesday",
  Thursday: "onboarding.days.thursday",
  Friday: "onboarding.days.friday",
  Saturday: "onboarding.days.saturday",
  Sunday: "onboarding.days.sunday",
};

// Dedicated abbreviation keys rather than slicing the full translated word —
// Telugu/Hindi don't abbreviate the way English does.
const DAY_ABBR_KEY: Record<string, string> = {
  Monday: "onboarding.daysShort.mon",
  Tuesday: "onboarding.daysShort.tue",
  Wednesday: "onboarding.daysShort.wed",
  Thursday: "onboarding.daysShort.thu",
  Friday: "onboarding.daysShort.fri",
  Saturday: "onboarding.daysShort.sat",
  Sunday: "onboarding.daysShort.sun",
};

/** Translated display label for a day value — the value itself (used for
 * state, keys, and the backend payload) is never translated. */
export function dayLabel(day: string): string {
  const key = DAY_LABEL_KEY[day];
  return key ? i18n.t(key) : day;
}

/** Short (3-letter-equivalent) translated label for a day value. */
export function dayLabelShort(day: string): string {
  const key = DAY_ABBR_KEY[day];
  return key ? i18n.t(key) : day.slice(0, 3);
}

const CUISINE_LABEL_KEY: Record<string, string> = {
  "North Indian": "onboarding.cuisines.northIndian",
  "South Indian": "onboarding.cuisines.southIndian",
  Chinese: "onboarding.cuisines.chinese",
  Italian: "onboarding.cuisines.italian",
  Bakery: "onboarding.cuisines.bakery",
  "Fast Food": "onboarding.cuisines.fastFood",
  "Street Food": "onboarding.cuisines.streetFood",
  Continental: "onboarding.cuisines.continental",
  Mexican: "onboarding.cuisines.mexican",
  Japanese: "onboarding.cuisines.japanese",
  Thai: "onboarding.cuisines.thai",
  Healthy: "onboarding.cuisines.healthy",
  Desserts: "onboarding.cuisines.desserts",
  Beverages: "onboarding.cuisines.beverages",
  Mughlai: "onboarding.cuisines.mughlai",
};

const MEAT_CATEGORY_LABEL_KEY: Record<string, string> = {
  Chicken: "onboarding.meatCategories.chicken",
  Mutton: "onboarding.meatCategories.mutton",
  Fish: "onboarding.meatCategories.fish",
  Prawns: "onboarding.meatCategories.prawns",
  Eggs: "onboarding.meatCategories.eggs",
  "Ready to Cook": "onboarding.meatCategories.readyToCook",
};

/** Translated display label for a cuisine/meat-category value — the value
 * itself (used for selection state and the backend payload) is never
 * translated. */
export function categoryOptionLabel(option: string): string {
  const key = CUISINE_LABEL_KEY[option] || MEAT_CATEGORY_LABEL_KEY[option];
  return key ? i18n.t(key) : option;
}

export function getSteps() {
  return [
    { num: 1, label: i18n.t("onboarding.steps.restaurantInfo"), icon: "store" },
    { num: 2, label: i18n.t("onboarding.steps.menuAndOperational"), icon: "restaurant_menu" },
    { num: 3, label: i18n.t("onboarding.steps.documentsAndLegal"), icon: "description" },
    { num: 4, label: i18n.t("onboarding.steps.contractAndReview"), icon: "rate_review" },
  ];
}

export interface PartnerCopy {
  sidebarTitle: string;
  infoTitle: string;
  infoIntro: string;
  detailsTitle: string;
  businessLabel: string;
  businessPlaceholder: string;
  categoryLabel: string;
  categoryHelp: string;
  operatingHelp: string;
  menuTitle: string;
  menuHelp: string;
  manualEmptyTitle: string;
  manualEmptyHelp: string;
  manualCategoryHelp: string;
  gstExemptLabel: string;
  safetyTitle: string;
  safetyUploadDescription: string;
  contractServiceText: string;
  summaryLabel: string;
}

export function getPartnerCopy(): Record<PartnerType, PartnerCopy> {
  const t = i18n.t.bind(i18n);
  return {
    food: {
      sidebarTitle: t("onboarding.food.sidebarTitle"),
      infoTitle: t("onboarding.food.infoTitle"),
      infoIntro: t("onboarding.food.infoIntro"),
      detailsTitle: t("onboarding.food.detailsTitle"),
      businessLabel: t("onboarding.food.businessLabel"),
      businessPlaceholder: t("onboarding.food.businessPlaceholder"),
      categoryLabel: t("onboarding.food.categoryLabel"),
      categoryHelp: t("onboarding.food.categoryHelp"),
      operatingHelp: t("onboarding.food.operatingHelp"),
      menuTitle: t("onboarding.food.menuTitle"),
      menuHelp: t("onboarding.food.menuHelp"),
      manualEmptyTitle: t("onboarding.food.manualEmptyTitle"),
      manualEmptyHelp: t("onboarding.food.manualEmptyHelp"),
      manualCategoryHelp: t("onboarding.food.manualCategoryHelp"),
      gstExemptLabel: t("onboarding.food.gstExemptLabel"),
      safetyTitle: t("onboarding.food.safetyTitle"),
      safetyUploadDescription: t("onboarding.food.safetyUploadDescription"),
      contractServiceText: t("onboarding.food.contractServiceText"),
      summaryLabel: t("onboarding.food.summaryLabel"),
    },
    meat: {
      sidebarTitle: t("onboarding.meat.sidebarTitle"),
      infoTitle: t("onboarding.meat.infoTitle"),
      infoIntro: t("onboarding.meat.infoIntro"),
      detailsTitle: t("onboarding.meat.detailsTitle"),
      businessLabel: t("onboarding.meat.businessLabel"),
      businessPlaceholder: t("onboarding.meat.businessPlaceholder"),
      categoryLabel: t("onboarding.meat.categoryLabel"),
      categoryHelp: t("onboarding.meat.categoryHelp"),
      operatingHelp: t("onboarding.meat.operatingHelp"),
      menuTitle: t("onboarding.meat.menuTitle"),
      menuHelp: t("onboarding.meat.menuHelp"),
      manualEmptyTitle: t("onboarding.meat.manualEmptyTitle"),
      manualEmptyHelp: t("onboarding.meat.manualEmptyHelp"),
      manualCategoryHelp: t("onboarding.meat.manualCategoryHelp"),
      gstExemptLabel: t("onboarding.meat.gstExemptLabel"),
      safetyTitle: t("onboarding.meat.safetyTitle"),
      safetyUploadDescription: t("onboarding.meat.safetyUploadDescription"),
      contractServiceText: t("onboarding.meat.contractServiceText"),
      summaryLabel: t("onboarding.meat.summaryLabel"),
    },
  };
}
