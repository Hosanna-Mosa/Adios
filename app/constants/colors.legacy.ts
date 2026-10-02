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
