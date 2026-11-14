import { StyleSheet } from "react-native";
import { Image } from "expo-image";

// The splash: the Adios artwork (brush-stroke wordmark, shopping bag and the services around
// it) filling the screen. app/index.tsx fades the whole container out when the intro is done.

interface Props {
  /** Kept for callers (app/index.tsx still passes them); the artwork needs none of them. */
  letters?: any[];
  opacityAnim?: any;
  translateAnim?: any;
}

export const SPLASH_BG = "#E1E4ED";

export function LandingLoadingBody(_props: Props) {
  return (
    <Image
      source={require("@/assets/images/adios_hero.png")}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      accessibilityLabel="Adios"
    />
  );
}
