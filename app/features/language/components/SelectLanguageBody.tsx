import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import { elevation } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import type { ThemeTokens } from "@/constants/colors";
import type { SupportedLanguage } from "@/contexts/languageStore";
import { LanguageIllustration } from "./LanguageIllustration";

// Each option leads with its own native script — deliberately not run through t() —
// so a Telugu/Hindi speaker can find their language without first having to read English.
const OPTIONS: { code: SupportedLanguage; label: string; englishLabel: string; glyph: string }[] = [
  { code: "en", label: "English", englishLabel: "English", glyph: "EN" },
  { code: "te", label: "తెలుగు", englishLabel: "Telugu", glyph: "అ" },
  { code: "hi", label: "हिंदी", englishLabel: "Hindi", glyph: "अ" },
];

interface Props {
  tokens: ThemeTokens;
  /** Kept for callers; the screen reads its colours from `tokens`. */
  theme?: string;
  onSelect: (code: SupportedLanguage) => void;
  /** The language drawn as chosen. */
  selectedLanguage?: SupportedLanguage | null;
  /** Present only on the language gate (select-language.tsx): a Continue button, grey until a
   * language is chosen. Language settings applies the choice at once and has none. */
  onContinue?: () => void;
}

/**
 * The language screen: burgundy speech-bubble artwork over a white sheet holding the three
 * radio cards (the chosen one tinted pink with a filled radio) and, on the gate, Continue.
 */
export function SelectLanguageBody({ tokens, onSelect, selectedLanguage, onContinue }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const canContinue = !!selectedLanguage;

  return (
    <LinearGradient colors={[tokens.brandSkin, tokens.bg]} style={styles.root}>
      <View style={styles.art}>
        <LanguageIllustration tokens={tokens} />
      </View>

      <View style={[styles.sheet, elevation.md, { backgroundColor: tokens.surface, paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <Text style={[styles.heading, { color: tokens.brand }]}>{t("app.language.selectAppLanguage", "Select App Language")}</Text>

        <View style={styles.options} accessibilityRole="radiogroup">
          {OPTIONS.map((option) => {
            const isSelected = selectedLanguage === option.code;
            const isEnglish = option.code === "en";
            return (
              <Pressable
                key={option.code}
                onPress={() => onSelect(option.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected, checked: isSelected }}
                accessibilityLabel={option.label === option.englishLabel ? option.label : `${option.label}, ${option.englishLabel}`}
                style={({ pressed }) => [
                  styles.card,
                  { borderColor: tokens.border, backgroundColor: tokens.surface },
                  isSelected && { borderColor: tokens.brand, backgroundColor: tokens.brandSkin },
                  pressed && !isSelected && { backgroundColor: tokens.sunken },
                ]}
              >
                <View style={[styles.glyph, { backgroundColor: isEnglish ? tokens.border : tokens.brandSkin }]}>
                  <Text style={[styles.glyphText, { color: isEnglish ? tokens.text : tokens.brand }]}>{option.glyph}</Text>
                </View>
                <Text style={[styles.cardLabel, { color: tokens.text }]} numberOfLines={1}>{option.label}</Text>
                <View style={[styles.radio, { borderColor: isSelected ? tokens.brand : tokens.borderStrong }]}>
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: tokens.brand }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {onContinue && (
          <Pressable
            onPress={onContinue}
            disabled={!canContinue}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canContinue }}
            style={({ pressed }) => [
              styles.continueBtn,
              { backgroundColor: canContinue ? tokens.brand : tokens.muted },
              pressed && canContinue && { backgroundColor: tokens.brandPressed },
            ]}
          >
            <Text style={[styles.continueText, { color: tokens.onBrand }]}>{t("actions.continue")}</Text>
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  art: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 16 },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 16,
  },
  heading: {
    fontFamily: fontFamilies.heading.bold,
    fontSize: typography.sizes.large,
    lineHeight: typography.lineHeights.large,
    textAlign: "center",
    marginBottom: 14,
  },
  options: { gap: 8 },
  card: {
    minHeight: moderateScale(56),
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 14,
  },
  glyph: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    alignItems: "center",
    justifyContent: "center",
  },
  glyphText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.medium,
  },
  cardLabel: {
    flex: 1,
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.medium,
  },
  radio: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
  },
  continueBtn: {
    marginTop: 20,
    minHeight: moderateScale(52),
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.medium,
  },
});
