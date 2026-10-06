// ---------------------------------------------------------------------------
// Flavour design system, partner edition.
// Mirrors app/constants/colors.ts (the canonical source) token-for-token, so
// the partner app reads as the same product the customer orders from. The
// projects share no workspace, so the two files are kept in sync by
// convention rather than by import. Only the two services a partner can run
// (food and meat) are carried over.
// ---------------------------------------------------------------------------

export type ServiceTokens = { accent: string; skin: string; on: string };
/** The service accents a screen can theme itself with. */
export type ServiceKey = "food" | "meat";
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
  info: string;
  infoSkin: string;
  veg: string;
  nonveg: string;
  // Modal/backdrop scrim.
  overlay: string;
  brand: string;
  brandPressed: string;
  brandSkin: string;
  onBrand: string;
  services: Record<ServiceKey, ServiceTokens>;
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
    info: "#1F5FA8",
    infoSkin: "#E4EEFA",
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
    info: "#7FB2F0",
    infoSkin: "#0F2033",
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
    },
  },
};

export { radius, elevation, gradients } from "@/constants/scales";
