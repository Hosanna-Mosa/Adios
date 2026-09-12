import React from "react";
import { RefreshControl, RefreshControlProps } from "react-native";

/** Transparent `RefreshControl`. */
export function Refresh(props: RefreshControlProps) {
  return <RefreshControl {...props} />;
}
