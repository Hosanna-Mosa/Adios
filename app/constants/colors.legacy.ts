// The pre-designTokens palette. Ten screens still read `Colors[theme].xxx`
// and its values differ from designTokens, so it is kept verbatim rather than
// merged — migrating a screen across would change its colours.

const teal = "#0061a5";
const tealDark = "#004578";
const cyan = "#aec7f5";

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
    tint: "#4F3CF2",
    primary: "#4F3CF2",
    primaryDark: "#3D2ED1",
    primaryLight: "#879fcb",
    teal,
    tealDark,
    cyan,
    success: "#16794F",
    warning: "#92600A",
    error: "#C22A1E",
    tabIconDefault: "#8B8494",
    tabIconSelected: "#4F3CF2",
    shadow: "rgba(20, 16, 30, 0.06)",
    overlay: "rgba(20, 16, 30, 0.4)",
    cardGradientStart: "#4F3CF2",
    cardGradientEnd: "#7C63F5",
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
    tint: "#8B7FFF",
    primary: "#8B7FFF",
    primaryDark: "#7263FF",
    primaryLight: "#1b365c",
    teal: "#73b5fe",
    tealDark: "#0061a5",
    cyan: "#73b5fe",
    success: "#4FD495",
    warning: "#E9B44C",
    error: "#FF8579",
    tabIconDefault: "#8B8494",
    tabIconSelected: "#8B7FFF",
    shadow: "rgba(0, 0, 0, 0.4)",
    overlay: "rgba(0, 0, 0, 0.7)",
    cardGradientStart: "#8B7FFF",
    cardGradientEnd: "#2E2A36",
  },
};
