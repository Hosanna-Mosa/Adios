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

  // -------------------------------------------------------------------------
  // Tokens reclaimed from hardcoded hex literals during the view-layer
  // refactor. Every value below is byte-identical to the literal it replaces —
  // these names exist so call sites stop typing raw hex, not to restyle
  // anything. Grouped by the role the literal actually played at its call site.
  // -------------------------------------------------------------------------

  // Info / sky blue — used by PerformanceCard, HighDemandAreas, zone callouts
  info: "#0EA5E9",
  infoMid: "#0284C7",
  infoDark: "#0369A1",
  infoSurface: "#F0F9FF",
  infoBorder: "#E0F2FE",
  infoSkin: "#EEFAFF",
  infoSkinAlt: "#F0FCFF",
  infoAccent: "#2E78B7",
  infoAccentSkin: "#D2EBFF",
  iosBlue: "#007AFF",

  // Neutral slate ramp — leaked in from Tailwind defaults
  neutral900: "#0F172A",
  neutral800: "#1E293B",
  neutral600: "#475569",
  neutral500: "#64748B",
  neutral200: "#E2E8F0",
  neutral100: "#F1F5F9",
  neutral50: "#F8F9FA",
  systemGrey: "#F2F2F7",
  nearBlack: "#1C1C1E",

  // Danger — distinct from the brand `error` ramp already above
  danger: "#EF4444",
  dangerSurface: "#FEF2F2",
  dangerBorder: "#FECACA",

  // Success shades beyond the brand `success`
  successBright: "#22C55E",
  successStrong: "#15803D",
  successDeep: "#166534",
  successForest: "#2E7D32",
  successSkin: "#E8F5E9",
  successSkinAlt: "#EBFAF0",
  successSkinSoft: "#F1FBF5",
  successSkinPale: "#F0FDF4",
  successBorder: "#B8E6CA",

  // Warning / warm
  amber: "#F59E0B",
  warmSkin: "#FFF5E6",

  // Accent violet — profile badges
  violet: "#8B5CF6",
};

export default Colors;
