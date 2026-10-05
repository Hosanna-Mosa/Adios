import { ActivityIndicator } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

// A bare spinner for the "still loading" branch of a screen. Deliberately not
// a layout: callers keep their own centring, so migrating a screen to this does
// not move the spinner by a pixel.

interface Props {
  color: string;
  style?: StyleProp<ViewStyle>;
  size?: "small" | "large";
}

export function FullScreenLoader({ color, style, size = "large" }: Props) {
  return <ActivityIndicator size={size} color={color} style={style} />;
}
