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
  // In-progress status (live order steps, "Preparing" pills).
  info: string;
  infoSkin: string;
  veg: string;
  nonveg: string;
  // Modal/backdrop scrim.
  overlay: string;
  // Brand anchor — burgundy, shared by every service.
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
  // Light values come straight from "Adios UI Colour Palette"
  // (Adios_UI_Color_Palette.pdf). The palette defines no dark theme, so the dark
  // values are derived from the same burgundy hue.
  light: {
    bg: "#FCF6F6",
    surface: "#FFFFFF",
    sunken: "#FCEEF2",
    border: "#E8E5E7",
    borderStrong: "#D2CDD0",
    text: "#171717",
    sec: "#667085",
    muted: "#AEB4BE",
    success: "#28A745",
    successSkin: "#E8F5E9",
    warning: "#92600A",
    warningSkin: "#FBF0DC",
    error: "#D90000",
    errorSkin: "#FCE8E8",
    info: "#1D5FD6",
    infoSkin: "#EAF1FF",
    veg: "#28A745",
    nonveg: "#D90000",
    overlay: "rgba(23, 23, 23, 0.4)",
    brand: "#990039",
    brandPressed: "#860132",
    brandSkin: "#FCEEF2",
    onBrand: "#FFFFFF",
    services: {
      // One brand across every service — the palette has no per-service accents.
      food: { accent: "#990039", skin: "#FCEEF2", on: "#FFFFFF" },
      meat: { accent: "#990039", skin: "#FCEEF2", on: "#FFFFFF" },
      ride: { accent: "#990039", skin: "#FCEEF2", on: "#FFFFFF" },
      task: { accent: "#990039", skin: "#FCEEF2", on: "#FFFFFF" },
      delivery: { accent: "#990039", skin: "#FCEEF2", on: "#FFFFFF" },
    },
  },
  dark: {
    bg: "#151012",
    surface: "#1F181B",
    sunken: "#0E0A0C",
    border: "#322A2E",
    borderStrong: "#473D42",
    text: "#F7F2F3",
    sec: "#B5AEB4",
    muted: "#8A828A",
    success: "#4FD46B",
    successSkin: "#0F2A16",
    warning: "#E9B44C",
    warningSkin: "#2E2209",
    error: "#FF6B6B",
    errorSkin: "#331414",
    info: "#6EA0FF",
    infoSkin: "#14213D",
    veg: "#4FD46B",
    nonveg: "#FF6B6B",
    overlay: "rgba(0, 0, 0, 0.7)",
    brand: "#E5648F",
    brandPressed: "#CF4C79",
    brandSkin: "#33141F",
    onBrand: "#151012",
    services: {
      food: { accent: "#E5648F", skin: "#33141F", on: "#151012" },
      meat: { accent: "#E5648F", skin: "#33141F", on: "#151012" },
      ride: { accent: "#E5648F", skin: "#33141F", on: "#151012" },
      task: { accent: "#E5648F", skin: "#33141F", on: "#151012" },
      delivery: { accent: "#E5648F", skin: "#33141F", on: "#151012" },
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
