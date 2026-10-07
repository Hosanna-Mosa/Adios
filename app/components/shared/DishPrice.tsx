import React from "react";
import { StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";
import { designTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { discountPercentOf, validOfferPrice } from "@/utils/pricing";

// A dish's price wherever it is shown. With a valid offer (offerPrice below
// price) it reads: ~~₹299~~ ₹199, and "33% OFF" underneath in the success
// colour. Without one it is just the price in the caller's own style, so
// adopting it changes nothing for dishes that have no offer.

interface Props {
  price: number;
  offerPrice?: number | null;
  discountPercent?: number | null;
  /** The caller's existing price text style (size, colour, spacing). */
  priceStyle?: StyleProp<TextStyle>;
  /** Extra wrapper style. */
  style?: StyleProp<ViewStyle>;
  /** Hide the "X% OFF" line (tight spaces). */
  hidePercent?: boolean;
}

export function DishPrice({ price, offerPrice, discountPercent, priceStyle, style, hidePercent }: Props) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const offer = validOfferPrice({ price, offerPrice });
  const percent = discountPercentOf({ price, offerPrice, discountPercent });

  if (offer == null) {
    return <Text style={[priceStyle, style as StyleProp<TextStyle>]}>₹{price}</Text>;
  }

  // The caller's price style may carry spacing (e.g. marginTop: 4); with two
  // figures that spacing moves to the wrapper so the block sits where the plain
  // price did.
  const flat = StyleSheet.flatten(priceStyle) || {};
  const spacing: ViewStyle = { marginTop: flat.marginTop, marginBottom: flat.marginBottom, marginLeft: flat.marginLeft, marginRight: flat.marginRight };

  return (
    <View style={[spacing, style]}>
      <View style={styles.row}>
        <Text
          style={[priceStyle, styles.reset, styles.struck, { color: tokens.muted }]}
          accessibilityLabel={t("app.food.originalPrice", { price: `₹${price}` })}
        >
          ₹{price}
        </Text>
        <Text style={[priceStyle, styles.reset, styles.offer, { color: tokens.text }]}>₹{offer}</Text>
      </View>
      {!hidePercent && percent != null && (
        <Text style={[styles.percent, { color: tokens.success }]}>{t("app.food.percentOff", { percent })}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", gap: 6, flexWrap: "wrap" },
  // The caller's margins belong to the wrapper, not to each figure.
  reset: { marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 },
  struck: { textDecorationLine: "line-through", fontFamily: fontFamilies.body.regular },
  offer: { fontFamily: fontFamilies.body.bold },
  percent: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, marginTop: 2 },
});
