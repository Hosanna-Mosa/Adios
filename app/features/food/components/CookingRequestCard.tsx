import { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";

// "Add a cooking request (optional)" on a dish's detail sheet. For a meat centre the same
// box asks how the meat should be cut. The note travels with the dish into the order.

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** A meat centre asks about the cut instead of cooking. */
  isMeat: boolean;
  tokens: ThemeTokens;
}

const ms = moderateScale;

export function CookingRequestCard({ value, onChange, isMeat, tokens }: Props) {
  const { t } = useTranslation();
  const s = useMemo(() => makeStyles(tokens), [tokens]);
  const title = isMeat ? t("app.food.meatCutTitle", "Add a Meat Cut Request (optional)") : t("app.food.cookingRequestTitle", "Add a cooking request (optional)");
  const hint = isMeat
    ? t("app.food.meatCutHint", "Tell us how you'd like your meat to be cut. We'll try our best to fulfil your request.")
    : t("app.food.cookingRequestHint", "The restaurant will try its best to fulfil your requests. However, refunds or cancellations related to such requests won't be possible.");
  const placeholder = isMeat
    ? t("app.food.meatCutPlaceholder", "e.g. Curry cut, medium-sized pieces, small pieces, boneless...")
    : t("app.food.cookingRequestPlaceholder", "e.g. Don't make it too spicy");

  return (
    <View style={s.card}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.hint}>{hint}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={tokens.muted}
        multiline
        maxLength={200}
        textAlignVertical="top"
        accessibilityLabel={title}
      />
    </View>
  );
}

const makeStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: { marginTop: ms(16), padding: ms(16), borderRadius: ms(16), backgroundColor: tokens.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: tokens.border },
    title: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium, color: tokens.text },
    hint: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.sec, marginTop: ms(6) },
    input: { marginTop: ms(12), minHeight: ms(84), borderRadius: ms(12), backgroundColor: tokens.sunken, paddingHorizontal: ms(14), paddingVertical: ms(12), fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.text },
  });
