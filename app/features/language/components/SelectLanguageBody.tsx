import React from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import { elevation } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import type { ThemeTokens } from "@/constants/colors";
import type { SupportedLanguage } from "@/contexts/languageStore";

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
  const { height: windowHeight } = useWindowDimensions();
  // The share is of the screen the user actually sees: measured from this container, because on
  // Android the window height leaves out the system bars and 47% of it comes up short.
  const [rootHeight, setRootHeight] = useState(0);
  const height = rootHeight || windowHeight;
  const canContinue = !!selectedLanguage;
  // Design: the artwork covers the top 47% of the screen and the language card the other 53%.
  const artHeight = Math.round(height * ART_RATIO);

  return (
    <LinearGradient colors={[ART_BG, ART_BG]} style={styles.root} onLayout={(e) => setRootHeight(e.nativeEvent.layout.height)}>
      <View style={[styles.art, { height: artHeight }]}>
        <Image source={HERO} style={styles.artImage} contentFit="cover" accessibilityIgnoresInvertColors />
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
                {/* EN sits on a soft grey disc until chosen, then turns the same pink as the other two. */}
                <View style={[styles.glyph, { backgroundColor: isEnglish && !isSelected ? EN_IDLE_BG : GLYPH_PINK }]}>
                  <Text style={[styles.glyphText, { color: tokens.brand }]}>{option.glyph}</Text>
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

const HERO = require("@/assets/images/language_hero.png");
const ART_RATIO = 0.47;
const ART_BG = "#FCEEF3";
const EN_IDLE_BG = "#E7E9EE";
const GLYPH_PINK = "#F9D9E5";

const styles = StyleSheet.create({
  root: { flex: 1 },
  art: { width: "100%", overflow: "hidden" },
  artImage: { width: "100%", height: "100%" },
  sheet: {
    flex: 1,
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
