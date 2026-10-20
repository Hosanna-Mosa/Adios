import { useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { designTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { fadeInUp } from "@/motion/presets";
import { RAISE_FARE_OPTIONS } from "../useFindingDriverRaiseFare";

interface Props {
  isPackageDelivery: boolean;
  raising: number | null;
  onRaise: (amount: number) => void;
}

/** Shown on the finding screen once nobody has accepted: add to the fare and search again. */
export function FindingDriverRaiseFare({ isPackageDelivery, raising, onRaise }: Props) {
  const { t } = useTranslation();
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <Animated.View entering={fadeInUp(0)} style={styles.card}>
      <Text style={styles.title}>
        {isPackageDelivery ? t("app.raiseFare.titlePackage") : t("app.raiseFare.titleRide")}
      </Text>
      <Text style={styles.subtitle}>{t("app.raiseFare.subtitle")}</Text>
      <View style={styles.row}>
        {RAISE_FARE_OPTIONS.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.pill, raising != null && raising !== amount && styles.pillDim]}
            onPress={() => onRaise(amount)}
            disabled={raising != null}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t("app.raiseFare.addAmount", { amount })}
          >
            {raising === amount ? (
              <ActivityIndicator size="small" color={tokens.brand} />
            ) : (
              <Text style={styles.pillText}>+₹{amount}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: { backgroundColor: tokens.brandSkin, borderWidth: 1, borderColor: tokens.brand, borderRadius: 16, padding: 14, marginBottom: 12 },
    title: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.text },
    subtitle: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, lineHeight: typography.lineHeights.small, color: tokens.sec, marginTop: 4, marginBottom: 12 },
    row: { flexDirection: "row", gap: 8 },
    pill: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1.5, borderColor: tokens.brand, backgroundColor: tokens.surface, alignItems: "center", justifyContent: "center" },
    pillDim: { opacity: 0.45 },
    pillText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.medium, color: tokens.brand },
  });
