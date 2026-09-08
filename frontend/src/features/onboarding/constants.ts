import type { PartnerType } from "./types";
export const STEPS = [
  { num: 1, label: "Restaurant Information", icon: "store" },
  { num: 2, label: "Menu & Operational Details", icon: "restaurant_menu" },
  { num: 3, label: "Documents & Legal", icon: "description" },
  { num: 4, label: "Contract & Review", icon: "rate_review" },
];

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
];

export const MEAT_CATEGORY_OPTIONS = [
  "Chicken",
  "Mutton",
  "Fish",
  "Prawns",
  "Eggs",
  "Ready to Cook",
];
export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const MENU_UPLOAD_COLUMNS = [
  "category",
  "itemName",
  "price",
  "description",
  "type",
  "isBestseller",
];
export const MENU_TEMPLATE_FILE = "/menu_items_reference_template.xlsx";

export const PARTNER_COPY: Record<
  PartnerType,
  {
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
> = {
  food: {
    sidebarTitle: "Restaurant Onboarding",
    infoTitle: "Restaurant Information",
    infoIntro: "Tell us about your restaurant to get started.",
    detailsTitle: "Restaurant Details",
    businessLabel: "Restaurant Name",
    businessPlaceholder: "e.g. Paradise Biryani",
    categoryLabel: "Cuisine / Food Category",
    categoryHelp: "Select all that apply to your restaurant",
    operatingHelp:
      "Add multiple time slots if your restaurant has break times.",
    menuTitle: "Menu Setup",
    menuHelp:
      "Set up your restaurant's operating hours and add your menu items.",
    manualEmptyTitle: "No menu items yet",
    manualEmptyHelp: "Add your first category to start building your menu",
    manualCategoryHelp:
      "Add categories (e.g. Appetizers, Main Course) and their items",
    gstExemptLabel: "My restaurant is exempt / Composition scheme",
    safetyTitle: "Food Safety License",
    safetyUploadDescription:
      "Upload a clear scan or photo of your FSSAI license",
    contractServiceText: "the sale and delivery of food items",
    summaryLabel: "Restaurant",
  },
  meat: {
    sidebarTitle: "Meat Center Onboarding",
    infoTitle: "Meat Center Information",
    infoIntro: "Tell us about your meat center to get started.",
    detailsTitle: "Meat Center Details",
    businessLabel: "Meat Center Name",
    businessPlaceholder: "e.g. Fresh Cuts Meat Center",
    categoryLabel: "Meat Categories",
    categoryHelp: "Select the product categories available at your center",
    operatingHelp:
      "Add multiple time slots if your meat center has break times.",
    menuTitle: "Meat Product Setup",
    menuHelp: "Set up your meat center's operating hours.",
    manualEmptyTitle: "No meat products yet",
    manualEmptyHelp:
      "Add your first product category to start building your list",
    manualCategoryHelp:
      "Add categories (e.g. Chicken, Mutton, Fish) and their products",
    gstExemptLabel: "My meat center is exempt / Composition scheme",
    safetyTitle: "FSSAI License",
    safetyUploadDescription:
      "Upload a clear scan or photo of your FSSAI license",
    contractServiceText: "the sale and delivery of meat products",
    summaryLabel: "Meat Center",
  },
};
