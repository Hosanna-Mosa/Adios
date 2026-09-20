// ---------------------------------------------------------------------------
// Flavour design system — canonical source of truth.
// driver/constants/colors.ts mirrors this file's shape (see header comment
// there) with its own `brand` accent — app/ and driver/ are separate Expo
// projects with no shared workspace, so the two files are kept in sync by
// convention rather than by import.
// ---------------------------------------------------------------------------

// Retained only for the legacy `teal`/`cyan` secondary-accent fields below —
// `primary`/`primaryDark`/`primaryLight` were superseded by the indigo brand
// color and are set directly in the default export instead.
const teal = "#0061a5";
const tealDark = "#004578";
const cyan = "#aec7f5";

// New design-system tokens (from the "Design system foundations" spec).
// Kept separate from the legacy `Colors` export below so existing screens
// that read Colors[theme].xxx keep working untouched; new screens being
// rebuilt against the new mockups should import `designTokens` instead.
export type ServiceTokens = { accent: string; skin: string; on: string };
export type ThemeTokens = {
  bg: string;
  surface: string;
  sunken: string;
  border: string;
  borderStrong: string;
  text: string;
  sec: string;
  muted: string;
  success: string;
  successSkin: string;
  warning: string;
  warningSkin: string;
  error: string;
  errorSkin: string;
  veg: string;
  nonveg: string;
  // Modal/backdrop scrim.
  overlay: string;
  // Brand anchor — the same orange the food/ride services use, so screens with
  // no service context (login, account) read as the same app as the rest of it.
  // Was an electric indigo, which left those screens looking purple.
  brand: string;
  brandPressed: string;
  brandSkin: string;
  onBrand: string;
  services: {
    food: ServiceTokens;
    meat: ServiceTokens;
    ride: ServiceTokens;
    task: ServiceTokens;
    delivery: ServiceTokens;
  };
};

export const designTokens: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
    bg: "#FAF8F5",
    surface: "#FFFFFF",
    sunken: "#F0ECE6",
    border: "#E4DFD7",
    borderStrong: "#CFC8BC",
    text: "#1A1720",
    sec: "#56505E",
    muted: "#8B8494",
    success: "#16794F",
    successSkin: "#E3F5EC",
    warning: "#92600A",
    warningSkin: "#FBF0DC",
    error: "#C22A1E",
    errorSkin: "#FCEAE8",
    veg: "#16794F",
    nonveg: "#B5281F",
    overlay: "rgba(20, 16, 30, 0.4)",
    brand: "#E8720C",
    brandPressed: "#C25F0A",
    brandSkin: "#FDF0E2",
    onBrand: "#FFFFFF",
    services: {
      food: { accent: "#E8720C", skin: "#FDF0E2", on: "#FFFFFF" },
      meat: { accent: "#C13566", skin: "#FBE8EF", on: "#FFFFFF" },
      // Ride deliberately shares Food's orange rather than carrying its own teal:
      // the ride flow is meant to read as the same app as the home screen, not as
      // a separate product. Meat is the one service that still recolours the UI.
      ride: { accent: "#E8720C", skin: "#FDF0E2", on: "#FFFFFF" },
      task: { accent: "#E8720C", skin: "#FDF0E2", on: "#FFFFFF" },
      delivery: { accent: "#5B8A1E", skin: "#EFF5E1", on: "#FFFFFF" },
    },
  },
  dark: {
    bg: "#131118",
    surface: "#1E1B24",
    sunken: "#0B0A0F",
    border: "#2E2A36",
    borderStrong: "#433C4D",
    text: "#F5F2F8",
    sec: "#B3ACBD",
    muted: "#8B8494",
    success: "#4FD495",
    successSkin: "#0C2A1D",
    warning: "#E9B44C",
    warningSkin: "#2E2209",
    error: "#FF8579",
    errorSkin: "#331512",
    veg: "#5FD68C",
    nonveg: "#FF8A80",
    overlay: "rgba(0, 0, 0, 0.7)",
    brand: "#FF9A4D",
    brandPressed: "#E8842F",
    brandSkin: "#33200F",
    onBrand: "#131118",
    services: {
      food: { accent: "#FF9A4D", skin: "#33200F", on: "#131118" },
      meat: { accent: "#F589AC", skin: "#331522", on: "#131118" },
      ride: { accent: "#FF9A4D", skin: "#33200F", on: "#131118" },
      task: { accent: "#FF9A4D", skin: "#33200F", on: "#131118" },
      delivery: { accent: "#A6D65C", skin: "#232B10", on: "#131118" },
    },
  },
};

// Elevation, radius, and gradient tokens — additive to the palette above.
// Shadows are intentionally soft (low opacity, large blur, small y-offset)
// rather than hard drop shadows; radii are larger/friendlier than a typical
// "corporate" card. `elevation` values map directly onto RN's shadow* style
// props (iOS) — Android additionally needs the numeric `elevation` prop,
// included per level.
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

// Tuples typed for react-native-linear-gradient / expo-linear-gradient's
// `colors` prop (requires at least 2 entries).
export const gradients: {
  light: Record<"brand" | "food" | "meat" | "ride" | "task" | "delivery", [string, string]>;
  dark: Record<"brand" | "food" | "meat" | "ride" | "task" | "delivery", [string, string]>;
} = {
  light: {
    brand: ["#E8720C", "#F3924A"],
    food: ["#E8720C", "#F3924A"],
    meat: ["#C13566", "#D65F8A"],
    ride: ["#E8720C", "#F3924A"],
    task: ["#E8720C", "#F3924A"],
    delivery: ["#5B8A1E", "#82AE49"],
  },
  dark: {
    brand: ["#FF9A4D", "#FFB878"],
    food: ["#FF9A4D", "#FFB878"],
    meat: ["#F589AC", "#FAAAC6"],
    ride: ["#FF9A4D", "#FFB878"],
    task: ["#FF9A4D", "#FFB878"],
    delivery: ["#A6D65C", "#C1E58A"],
  },
};

export default {
  light: {
    text: "#1A1720",
    textSecondary: "#56505E",
    textMuted: "#8B8494",
    background: "#FAF8F5",
    surface: "#ffffff",
    surfaceSecondary: "#F0ECE6",
    border: "#E4DFD7",
    borderLight: "#F0ECE6",
    tint: "#E8720C",
    primary: "#E8720C",
    primaryDark: "#C25F0A",
    primaryLight: "#879fcb",
    teal,
    tealDark,
    cyan,
    success: "#16794F",
    warning: "#92600A",
    error: "#C22A1E",
    tabIconDefault: "#8B8494",
    tabIconSelected: "#E8720C",
    shadow: "rgba(20, 16, 30, 0.06)",
    overlay: "rgba(20, 16, 30, 0.4)",
    cardGradientStart: "#E8720C",
    cardGradientEnd: "#F3924A",
  },
  dark: {
    text: "#F5F2F8",
    textSecondary: "#B3ACBD",
    textMuted: "#8B8494",
    background: "#131118",
    surface: "#1E1B24",
    surfaceSecondary: "#2E2A36",
    border: "#2E2A36",
    borderLight: "#2E2A36",
    tint: "#FF9A4D",
    primary: "#FF9A4D",
    primaryDark: "#E8842F",
    primaryLight: "#1b365c",
    teal: "#73b5fe",
    tealDark: "#0061a5",
    cyan: "#73b5fe",
    success: "#4FD495",
    warning: "#E9B44C",
    error: "#FF8579",
    tabIconDefault: "#8B8494",
    tabIconSelected: "#FF9A4D",
    shadow: "rgba(0, 0, 0, 0.4)",
    overlay: "rgba(0, 0, 0, 0.7)",
    cardGradientStart: "#FF9A4D",
    cardGradientEnd: "#2E2A36",
  },
};
