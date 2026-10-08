import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { formatCurrency } from "@/utils/format";
import { discountPercent } from "@/utils/number";

interface Props {
  price: number;
  offerPrice?: number | null;
  tokens: ThemeTokens;
  /** Smaller text, for dense lists such as the bulk-upload preview. */
  compact?: boolean;
}

/** The price as customers see it: with a valid offer, the original struck through, the offer price and "X% OFF". */
export function PriceTag({ price, offerPrice, tokens, compact }: Props) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const percent = discountPercent(price, offerPrice);
  const main = compact ? styles.mainCompact : styles.main;

  if (percent == null || offerPrice == null) return <Text style={main}>{formatCurrency(price)}</Text>;
  return (
    <View style={styles.row}>
      <Text style={main}>{formatCurrency(offerPrice)}</Text>
      <Text style={styles.struck}>{formatCurrency(price)}</Text>
      <Text style={styles.off}>{t("menu.percentOff", { percent })}</Text>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 8, rowGap: 2, marginTop: 2 },
    main: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.text, marginTop: 2 },
    mainCompact: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    struck: {
      fontFamily: fontFamilies.body.medium,
      fontSize: typography.sizes.small,
      color: tokens.muted,
      textDecorationLine: "line-through",
    },
    off: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, color: tokens.success, textTransform: "uppercase" },
  });
