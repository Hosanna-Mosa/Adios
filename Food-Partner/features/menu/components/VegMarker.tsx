import { View } from "react-native";
import type { ThemeTokens } from "@/constants/colors";
import type { MenuStyles } from "../menu.styles";

/** The square-with-dot veg / non-veg label printed on Indian food packaging. */
export function VegMarker({ isVeg, styles, tokens }: { isVeg: boolean; styles: Pick<MenuStyles, "vegBox" | "vegDot">; tokens: ThemeTokens }) {
  const color = isVeg ? tokens.veg : tokens.nonveg;
  return (
    <View style={[styles.vegBox, { borderColor: color }]}>
      <View style={[styles.vegDot, { backgroundColor: color }]} />
    </View>
  );
}
