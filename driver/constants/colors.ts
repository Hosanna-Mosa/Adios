// ---------------------------------------------------------------------------
// Flavour Driver colors — mirrors the semantic categories in the customer
// app's design system (/Users/ravindra/Documents/Adios/app/constants/colors.ts
// `designTokens`), with its own brand accent (cyan-teal, distinct from the
// customer app's indigo — same relationship as Uber vs. Uber Driver). Kept
// flat (no light/dark nesting) since the driver app has no dark-mode toggle
// today; every existing `Colors.x` call site keeps working unchanged.
// ---------------------------------------------------------------------------

export const Colors = {
  // Primary (Brand Cyan-Teal)
  primary: "#00B4C6",
  primaryDark: "#00838F",
  primaryLight: "#CFF4F7",
  primaryContainer: "#33C5D6",
  brand: "#00B4C6",
  brandPressed: "#00838F",
  brandSkin: "#E0F7F9",
  onBrand: "#FFFFFF",

  // Secondary (warm neutral, matches the customer app's `sec`)
  secondary: "#56505E",
  secondaryLight: "#EEE9FC",
  secondaryContainer: "#EEE9FC",

  // Tertiary / Success (Operational Green)
  success: "#16794F",
  successLight: "#E3F5EC",
  tertiary: "#16794F",
  tertiaryLight: "#E3F5EC",

  // Surface & Background — warm neutrals, matches the customer app
  background: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceContainer: "#F0ECE6",
  surfaceContainerLow: "#F5F1EB",
  surfaceContainerHigh: "#E4DFD7",
  border: "#E4DFD7",
  outline: "#8B8494",
  surfaceAlt: "#F0ECE6",
  warning: "#92600A",
  warningLight: "#FBF0DC",

  // Text
  text: "#1A1720",
  textSecondary: "#56505E",
  textMuted: "#8B8494",

  // Functional
  white: "#FFFFFF",
  black: "#000000",
  error: "#C22A1E",
  errorLight: "#FCEAE8",
  overlay: "rgba(20, 16, 30, 0.4)",
  cardShadow: "rgba(20, 16, 30, 0.08)",

  // Status
  online: "#16794F",
  offline: "#8B8494",

  // Tab Bar
  tabBar: "#FFFFFF",
  tabActive: "#00B4C6",
  tabInactive: "#8B8494",

  // Surge Zone
  surge: "#00E5FF",
};

// Service accents — same hues as the customer app's designTokens.light.services
// so a "ride" or "delivery" badge reads as the same color in both apps.
export type ServiceTokens = { accent: string; skin: string; on: string };
export const services: {
  food: ServiceTokens;
  meat: ServiceTokens;
  ride: ServiceTokens;
  task: ServiceTokens;
  delivery: ServiceTokens;
} = {
  food: { accent: "#E8720C", skin: "#FDF0E2", on: "#FFFFFF" },
  meat: { accent: "#C13566", skin: "#FBE8EF", on: "#FFFFFF" },
  ride: { accent: "#0A7EA8", skin: "#E1F2F8", on: "#FFFFFF" },
  task: { accent: "#6C4FE0", skin: "#EEE9FC", on: "#FFFFFF" },
  delivery: { accent: "#5B8A1E", skin: "#EFF5E1", on: "#FFFFFF" },
};

// Elevation, radius, and gradient tokens — same values as the customer app's
// light mode (see app/constants/colors.ts for the shape/rationale).
export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const elevation = {
  sm: {
    shadowColor: "#14101E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#14101E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  lg: {
    shadowColor: "#14101E",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 12,
  },
} as const;

export const gradients: Record<"brand" | "food" | "meat" | "ride" | "task" | "delivery", [string, string]> = {
  brand: ["#00B4C6", "#3FCBD8"],
  food: ["#E8720C", "#F3924A"],
  meat: ["#C13566", "#D65F8A"],
  ride: ["#0A7EA8", "#3AA7CE"],
  task: ["#6C4FE0", "#9078EE"],
  delivery: ["#5B8A1E", "#82AE49"],
};

export default Colors;
