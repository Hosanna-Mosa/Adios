import React from "react";
import { View } from "react-native";

/** Evenly spaced stack of fields inside one onboarding step. */
export function FieldColumn({
  gap = 16,
  children,
}: {
  gap?: number;
  children: React.ReactNode;
}) {
  return <View style={{ gap }}>{children}</View>;
}
