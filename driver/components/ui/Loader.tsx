import React from "react";
import { ActivityIndicator, ActivityIndicatorProps } from "react-native";

/** Transparent `ActivityIndicator`. Adds no default colour or size, so a
 *  migrated call site renders exactly as it did. */
export function Loader(props: ActivityIndicatorProps) {
  return <ActivityIndicator {...props} />;
}
