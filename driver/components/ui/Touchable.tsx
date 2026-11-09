import React from "react";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";

/** Transparent `TouchableOpacity` — keeps the opacity-fade press feedback.
 *
 * Kept separate from `PressBox` on purpose: `TouchableOpacity` fades on press
 * and `Pressable` does not, so collapsing both into one component would change
 * how a third of the app's buttons feel.
 */
export const Touchable = React.forwardRef<View, TouchableOpacityProps>(
  function Touchable(props, ref) {
    // Anything pressable is announced as a button (and as disabled when it is)
    // unless the caller says otherwise, so screen readers can tell it is tappable.
    return (
      <TouchableOpacity
        ref={ref}
        accessibilityRole={props.onPress ? "button" : undefined}
        accessibilityState={props.disabled ? { disabled: true } : undefined}
        {...props}
      />
    );
  },
);
