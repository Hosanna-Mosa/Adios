import React from "react";
import { Pressable, PressableProps, View } from "react-native";

/** Transparent `Pressable`. See `Touchable` for why the two stay distinct. */
export const PressBox = React.forwardRef<View, PressableProps>(
  function PressBox(props, ref) {
    // Anything pressable is announced as a button (and as disabled when it is)
    // unless the caller says otherwise, so screen readers can tell it is tappable.
    return (
      <Pressable
        ref={ref}
        accessibilityRole={props.onPress ? "button" : undefined}
        accessibilityState={props.disabled ? { disabled: true } : undefined}
        {...props}
      />
    );
  },
);
