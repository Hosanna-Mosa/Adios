// The pre-designTokens palette. Ten screens still read `Colors[theme].xxx`
// and its values differ from designTokens, so it is kept verbatim rather than
// merged — migrating a screen across would change its colours.

const teal = "#0061a5";
const tealDark = "#004578";
const cyan = "#aec7f5";

export default {
  light: {
    text: "#171717",
    textSecondary: "#667085",
    textMuted: "#AEB4BE",
    background: "#FCF6F6",
    surface: "#ffffff",
    surfaceSecondary: "#FCEEF2",
    border: "#E8E5E7",
    borderLight: "#FCEEF2",
    tint: "#990039",
    primary: "#990039",
    primaryDark: "#860132",
    primaryLight: "#FCEEF2",
    teal,
    tealDark,
    cyan,
    success: "#28A745",
    warning: "#92600A",
    error: "#D90000",
    tabIconDefault: "#AEB4BE",
    tabIconSelected: "#860132",
    shadow: "rgba(23, 23, 23, 0.06)",
    overlay: "rgba(23, 23, 23, 0.4)",
    cardGradientStart: "#860132",
    cardGradientEnd: "#990039",
  },
  dark: {
    text: "#F7F2F3",
    textSecondary: "#B5AEB4",
    textMuted: "#8A828A",
    background: "#151012",
    surface: "#1F181B",
    surfaceSecondary: "#322A2E",
    border: "#322A2E",
    borderLight: "#322A2E",
    tint: "#E5648F",
    primary: "#E5648F",
    primaryDark: "#CF4C79",
    primaryLight: "#33141F",
    teal: "#73b5fe",
    tealDark: "#0061a5",
    cyan: "#73b5fe",
    success: "#4FD46B",
    warning: "#E9B44C",
    error: "#FF6B6B",
    tabIconDefault: "#8A828A",
    tabIconSelected: "#E5648F",
    shadow: "rgba(0, 0, 0, 0.4)",
    overlay: "rgba(0, 0, 0, 0.7)",
    cardGradientStart: "#E5648F",
    cardGradientEnd: "#322A2E",
  },
};
