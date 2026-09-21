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
/** The five service accents a screen can theme itself with. */
export type ServiceKey = "food" | "meat" | "ride" | "task" | "delivery";
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
  // Brand anchor — electric indigo. Used for primary CTAs, active states,
  // brand marks, progress indicators. Distinct from every competitor in this
  // space (Swiggy/Zomato red-orange, Uber/Ola/Rapido black-green-yellow).
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
    brand: "#4F3CF2",
    brandPressed: "#3D2ED1",
    brandSkin: "#EBE8FD",
    onBrand: "#FFFFFF",
    services: {
      food: { accent: "#E8720C", skin: "#FDF0E2", on: "#FFFFFF" },
      meat: { accent: "#C13566", skin: "#FBE8EF", on: "#FFFFFF" },
      ride: { accent: "#0A7EA8", skin: "#E1F2F8", on: "#FFFFFF" },
      task: { accent: "#6C4FE0", skin: "#EEE9FC", on: "#FFFFFF" },
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
    brand: "#8B7FFF",
    brandPressed: "#7263FF",
    brandSkin: "#241F3D",
    onBrand: "#131118",
    services: {
      food: { accent: "#FF9A4D", skin: "#33200F", on: "#131118" },
      meat: { accent: "#F589AC", skin: "#331522", on: "#131118" },
      ride: { accent: "#4FC7EC", skin: "#0B2A38", on: "#131118" },
      task: { accent: "#B7A6FF", skin: "#221B44", on: "#131118" },
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

// Re-exported so the many `from "@/constants/colors"` imports keep working
// after the split. These are the only two re-exports here — see scales.ts and
// colors.legacy.ts for the definitions.
export { radius, elevation, gradients } from "@/constants/scales";
export { default } from "@/constants/colors.legacy";
