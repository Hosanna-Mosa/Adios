import type { MapStyleElement } from "react-native-maps";
import { useThemeStore } from "@/contexts/themeStore";
import { DARK_MAP_STYLE } from "@/constants/mapStyle";

// Plain Google style in light mode (an empty style array resets any custom
// style), so light-mode maps look exactly as before.
const DEFAULT_STYLE: MapStyleElement[] = [];

/** Map style for the current app theme: dark in dark mode, `lightStyle` otherwise. */
export function useMapStyle(lightStyle: MapStyleElement[] = DEFAULT_STYLE): MapStyleElement[] {
  const theme = useThemeStore((s) => s.theme);
  return theme === "dark" ? DARK_MAP_STYLE : lightStyle;
}
