import React from "react";
import { View, ViewProps } from "react-native";

/** Transparent `View`.
 *
 * Exists so app code reads as a composition of named components instead of raw
 * React Native primitives. It adds no style and no behaviour of its own — it
 * renders exactly what `View` renders, which is what makes replacing `View`
 * with `Box` pixel-identical by construction.
 *
 * Deliberately has no `direction`/`gap`/`padding` props: injecting layout here
 * would make the swap a style change rather than a rename. Layout stays in the
 * feature's `.styles.ts` sheet, passed in via `style` as before.
 */
export const Box = React.forwardRef<View, ViewProps>(function Box(props, ref) {
  return <View ref={ref} {...props} />;
});
