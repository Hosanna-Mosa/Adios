import React, { useMemo } from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { designTokens, type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { usePaymentMethodStore, type PaymentFlow, type PaymentMethod } from "@/contexts/paymentMethodStore";

// Cash or Online, chosen before the customer taps Pay / Place order / Book. The choice lives
// in paymentMethodStore, so each flow's place-order handler reads it without prop drilling.
// Online opens Razorpay (utils/razorpay.ts); cash places the order directly.

interface Props {
  flow: PaymentFlow;
  accent: ServiceTokens;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const OPTIONS: { method: PaymentMethod; icon: keyof typeof Ionicons.glyphMap; title: string; hint: string }[] = [
  { method: "cash", icon: "cash-outline", title: "app.payment.cash", hint: "app.payment.cashHint" },
  { method: "online", icon: "card-outline", title: "app.payment.online", hint: "app.payment.onlineHint" },
];

export function PaymentMethodSelector({ flow, accent, disabled, style }: Props) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens, accent), [tokens, accent]);
  const selected = usePaymentMethodStore((s) => s.methods[flow]);
  const setMethod = usePaymentMethodStore((s) => s.setMethod);

  return (
    <View style={style} accessibilityRole="radiogroup" accessibilityLabel={t("app.payment.method")}>
      <Text style={styles.label}>{t("app.payment.method")}</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const active = selected === option.method;
          return (
            <TouchableOpacity
              key={option.method}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setMethod(flow, option.method)}
              disabled={disabled}
              activeOpacity={0.85}
              accessibilityRole="radio"
              accessibilityState={{ checked: active, disabled }}
            >
              <Ionicons name={option.icon} size={moderateScale(18)} color={active ? accent.accent : tokens.sec} />
              <View style={styles.optionText}>
                <Text style={[styles.title, active && styles.titleActive]} numberOfLines={1}>{t(option.title)}</Text>
                <Text style={styles.hint} numberOfLines={1}>{t(option.hint)}</Text>
              </View>
              <Ionicons
                name={active ? "radio-button-on" : "radio-button-off"}
                size={moderateScale(16)}
                color={active ? accent.accent : tokens.muted}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) =>
  StyleSheet.create({
    label: {
      fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small, letterSpacing: 1,
      textTransform: "uppercase", color: tokens.muted, marginBottom: 8,
    },
    row: { flexDirection: "row", gap: 10 },
    option: {
      flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minHeight: moderateScale(52),
      paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5,
      borderColor: tokens.border, backgroundColor: tokens.surface,
    },
    optionActive: { borderColor: accent.accent, backgroundColor: accent.skin },
    optionText: { flex: 1, minWidth: 0 },
    title: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    titleActive: { color: tokens.text },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: 1 },
  });
