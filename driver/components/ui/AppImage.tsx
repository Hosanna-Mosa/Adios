import React from "react";
import { Image, ImageProps } from "react-native";

/** Transparent `Image`. See `Box` for why these pass-throughs exist. */
export function AppImage(props: ImageProps) {
  return <Image {...props} />;
}
