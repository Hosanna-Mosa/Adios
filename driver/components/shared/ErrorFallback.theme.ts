import { Platform, useColorScheme } from "react-native";
import { Colors } from "@/constants/colors";

/** The crash screen deliberately uses its own colours rather than the app
 * palette: it has to stay readable when the app's own theming is what broke.
 * Values kept exactly as they were when this lived inside ErrorFallback. */
export function useErrorFallbackTheme() {
  const isDark = useColorScheme() === "dark";

  const theme = {
    background: isDark ? Colors.black : Colors.white,
    backgroundSecondary: isDark ? Colors.nearBlack : Colors.systemGrey,
    text: isDark ? Colors.white : Colors.black,
    textSecondary: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
    link: Colors.iosBlue,
    buttonText: Colors.white,
  };

  const monoFont = Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  });

  return { isDark, theme, monoFont };
}

/** Error message plus stack, formatted for the details sheet. */
export function formatErrorDetails(error: Error): string {
  let details = `Error: ${error.message}\n\n`;
  if (error.stack) {
    details += `Stack Trace:\n${error.stack}`;
  }
  return details;
}
