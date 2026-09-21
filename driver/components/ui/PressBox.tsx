import React from "react";
import { Pressable, PressableProps, View } from "react-native";

/** Transparent `Pressable`. See `Touchable` for why the two stay distinct. */
export const PressBox = React.forwardRef<View, PressableProps>(
  function PressBox(props, ref) {
    return <Pressable ref={ref} {...props} />;
  },
);
