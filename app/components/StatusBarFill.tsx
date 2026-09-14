import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * A real black bar sized to the status bar's height, meant to be dropped as
 * the first child inside any `<Modal statusBarTranslucent>` in this app.
 *
 * React Native's Modal renders into its own separate native window on
 * Android, entirely outside the main app's view hierarchy — so the black bar
 * drawn in app/_layout.tsx (RootLayoutNav) never appears while a modal is
 * open; the modal's own window paints over it. Since Expo SDK 54's Android
 * edge-to-edge behaviour also makes the classic StatusBar
 * translucent/backgroundColor props no-ops (see app/_layout.tsx), a modal's
 * own window needs this exact same real-view treatment independently, sized
 * from insets read inside that window rather than the main one.
 */
export function StatusBarFill() {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: insets.top,
        backgroundColor: "#000000",
        zIndex: 999,
      }}
    />
  );
}
