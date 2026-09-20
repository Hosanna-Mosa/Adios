import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { typography } from "@/constants/typography";

type SizeToken = keyof typeof typography.sizes;
type WeightToken = keyof typeof typography.weights;

interface Props extends TextProps {
  /** Typography size token. Omit to keep whatever `style` already declares. */
  size?: SizeToken;
  /** Font weight token. Omit to keep whatever `style` already declares. */
  weight?: WeightToken;
  /** Text colour. Omit to keep whatever `style` already declares. */
  color?: string;
}

/** Transparent `Text`, with optional typography tokens.
 *
 * With no token props it is a pure pass-through: same rendering as `Text`, so
 * replacing `Text` with `AppText` is a rename, not a restyle. That is why the
 * token props default to `undefined` rather than to a size or weight — a
 * default would silently restyle every migrated call site.
 *
 * Font *family* is not set here. It is applied globally in
 * `utils/typographyPatch.ts`, which swaps React Native's `Text` accessor, so
 * the `Text` imported above is already the patched one.
 */
export const AppText = React.forwardRef<Text, Props>(function AppText(
  { size, weight, color, style, ...rest },
  ref,
) {
  const tokens: TextStyle | undefined =
    size || weight || color
      ? {
          ...(size && { fontSize: typography.sizes[size], lineHeight: typography.lineHeights[size] }),
          ...(weight && { fontWeight: typography.weights[weight] }),
          ...(color && { color }),
        }
      : undefined;

  return <Text ref={ref} style={tokens ? [tokens, style] : style} {...rest} />;
});
