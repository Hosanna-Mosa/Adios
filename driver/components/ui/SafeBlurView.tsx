import React from "react";
import { Platform, View } from "react-native";
import { BlurView, type BlurViewProps } from "expo-blur";

/**
 * expo-blur's BlurView, minus the Android crash.
 *
 * On Android, expo-blur 15 always attaches the native Dimezis BlurView, even
 * when real blur is off. That view redraws the whole screen into a *software*
 * canvas, and any image decoded as a hardware bitmap (expo-image, <Image>)
 * then crashes the app: "Software rendering doesn't support hardware bitmaps".
 *
 * Android never got real blur here anyway (no experimentalBlurMethod), only a
 * translucent tint. So on Android this renders a plain View with exactly the
 * tint expo-blur would have drawn (see expo-blur's TintStyle.kt); iOS keeps
 * the real BlurView.
 */
export function SafeBlurView({
  intensity = 50,
  tint = "default",
  experimentalBlurMethod,
  blurReductionFactor,
  style,
  children,
  ...viewProps
}: BlurViewProps) {
  if (Platform.OS === "android") {
    return (
      <View {...viewProps} style={[style, { backgroundColor: androidTintColor(tint, intensity) }]}>
        {children}
      </View>
    );
  }
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      experimentalBlurMethod={experimentalBlurMethod}
      blurReductionFactor={blurReductionFactor}
      style={style}
      {...viewProps}
    >
      {children}
    </BlurView>
  );
}

/** Same colour expo-blur's Android fallback uses: rgb + alpha = intensity × per-tint opacity. */
function androidTintColor(tint: BlurViewProps["tint"], intensity: number): string {
  const level = Math.max(0, Math.min(100, intensity)) / 100;
  const rgba = (rgb: number, opacity: number) =>
    `rgba(${rgb}, ${rgb}, ${rgb}, ${Math.floor(255 * level * opacity) / 255})`;

  switch (tint) {
    case "light":
    case "extraLight":
    case "systemMaterialLight":
    case "systemUltraThinMaterialLight":
    case "systemThickMaterialLight":
      return rgba(249, 0.78);
    case "dark":
    case "systemMaterialDark":
      return rgba(25, 0.69);
    case "regular":
      return rgba(179, 0.82);
    case "systemThinMaterialDark":
      return rgba(37, 0.7);
    case "systemThickMaterialDark":
      return rgba(37, 0.9);
    case "systemUltraThinMaterialDark":
      return rgba(37, 0.55);
    case "systemChromeMaterialDark":
      return rgba(0, 0.75);
    default:
      // "default", "prominent", "systemMaterial" and the remaining light materials.
      return rgba(255, 0.44);
  }
}
