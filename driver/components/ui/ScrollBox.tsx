import React from "react";
import { ScrollView, ScrollViewProps } from "react-native";

/** Transparent `ScrollView`. See `Box` for why these pass-throughs exist. */
export const ScrollBox = React.forwardRef<ScrollView, ScrollViewProps>(
  function ScrollBox(props, ref) {
    return <ScrollView ref={ref} {...props} />;
  },
);
