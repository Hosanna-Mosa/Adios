import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { radius } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import type { ThemeTokens } from "@/constants/colors";
import type { SupportedLanguage } from "@/contexts/languageStore";
import { Button } from "@/components/ui/Button";

// Each option leads with its own native script — deliberately not run through t() —
// so a Telugu/Hindi speaker can find their language without first having to read
// English; the English name underneath helps everyone else.
const OPTIONS: { code: SupportedLanguage; nativeLabel: string; englishLabel: string; glyph: string }[] = [
  { code: "en", nativeLabel: "English", englishLabel: "English", glyph: "A" },
  { code: "te", nativeLabel: "తెలుగు", englishLabel: "Telugu", glyph: "తె" },
  { code: "hi", nativeLabel: "हिन्दी", englishLabel: "Hindi", glyph: "हि" },
];

interface Props {
  tokens: ThemeTokens;
  /** Kept for callers; the cards no longer blur, so the theme isn't read here. */
  theme?: string;
  onSelect: (code: SupportedLanguage) => void;
  /** The language drawn as chosen. */
  selectedLanguage?: SupportedLanguage | null;
  /** Present only on the language gate (select-language.tsx): a Continue button,
   * disabled until a language is chosen. Language settings applies the choice at once. */
  onContinue?: () => void;
}

/**
 * Language picker: radio cards with pressed feedback, a radio role and selected state,
 * marked in the brand accent like the rest of the app (it used success green), and a
 * real Continue button rather than a fourth option-looking pill.
 */
export function SelectLanguageBody({ tokens, onSelect, selectedLanguage, onContinue }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.content}>
      <Text style={[styles.heading, { color: tokens.text }]}>{t("app.language.chooseYourLanguage")}</Text>
      <Text style={[styles.subheading, { color: tokens.sec }]}>{t("app.language.youCanChangeThisLater")}</Text>

      <View style={styles.options} accessibilityRole="radiogroup">
        {OPTIONS.map((option) => {
          const isSelected = selectedLanguage === option.code;
          return (
            <Pressable
              key={option.code}
              onPress={() => onSelect(option.code)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, checked: isSelected }}
              accessibilityLabel={option.nativeLabel === option.englishLabel ? option.nativeLabel : `${option.nativeLabel}, ${option.englishLabel}`}
              style={({ pressed }) => [
                styles.card,
                { borderColor: tokens.border, backgroundColor: tokens.surface },
                isSelected && { borderColor: tokens.brand, backgroundColor: tokens.brandSkin },
                pressed && !isSelected && { backgroundColor: tokens.sunken },
              ]}
            >
              <View style={[styles.glyph, { backgroundColor: isSelected ? tokens.brand : tokens.sunken }]}>
                <Text style={[styles.glyphText, { color: isSelected ? tokens.onBrand : tokens.text }]}>{option.glyph}</Text>
              </View>
              <View style={styles.labels}>
                <Text style={[styles.cardLabel, { color: tokens.text }]} numberOfLines={1}>{option.nativeLabel}</Text>
                {option.nativeLabel !== option.englishLabel && (
                  <Text style={[styles.cardSubLabel, { color: tokens.sec }]} numberOfLines={1}>{option.englishLabel}</Text>
                )}
              </View>
              <View style={[styles.radio, { borderColor: isSelected ? tokens.brand : tokens.borderStrong }]}>
                {isSelected && <View style={[styles.radioDot, { backgroundColor: tokens.brand }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {onContinue && (
        <Button title={t("actions.continue")} onPress={onContinue} disabled={!selectedLanguage} fullWidth style={{ marginTop: 28 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  heading: {
    fontFamily: fontFamilies.heading.bold,
    fontSize: typography.sizes.extraLarge,
    lineHeight: typography.lineHeights.extraLarge,
    textAlign: "center",
    marginBottom: 8,
  },
  subheading: {
    fontFamily: fontFamilies.body.regular,
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
    textAlign: "center",
    marginBottom: 28,
  },
  options: {
    gap: 12,
  },
  card: {
    minHeight: 68,
    borderRadius: radius.md,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  glyph: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  glyphText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: typography.sizes.medium,
  },
  labels: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.large,
  },
  cardSubLabel: {
    fontFamily: fontFamilies.body.regular,
    fontSize: typography.sizes.small,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
});
