import React from "react";
import { SafeAreaView, ViewProps } from "react-native";

/** Transparent `SafeAreaView` (react-native's, not the safe-area-context one —
 *  the two behave differently, so this only replaces the react-native import). */
export function SafeArea(props: ViewProps) {
  return <SafeAreaView {...props} />;
}
