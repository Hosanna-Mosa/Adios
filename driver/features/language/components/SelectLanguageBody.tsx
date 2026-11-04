import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import { Colors, radius } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { Button } from "@/components/ui/Button";
import type { SupportedLanguage } from "@/store/languageStore";

// Each option leads with its own native script — deliberately not run through
// t() — so a Telugu/Hindi speaker can find their language without first having
// to read English; the English name underneath helps everyone else.
const OPTIONS: { code: SupportedLanguage; nativeLabel: string; englishLabel: string; glyph: string }[] = [
  { code: "en", nativeLabel: "English", englishLabel: "English", glyph: "A" },
  { code: "te", nativeLabel: "తెలుగు", englishLabel: "Telugu", glyph: "తె" },
  { code: "hi", nativeLabel: "हिन्दी", englishLabel: "Hindi", glyph: "हि" },
];

interface Props {
  onSelect: (code: SupportedLanguage) => void;
  /** Currently selected language — the option drawn as chosen. */
  selectedLanguage?: SupportedLanguage | null;
  /** Present only on the language gate (select-language.tsx): a Continue
   * button, disabled until a language is chosen. Language settings applies
   * the choice immediately and shows no button. */
  onContinue?: () => void;
}

/**
 * Language picker: radio cards (native name + English name) and, on the gate,
 * a real primary Continue button. Continue used to be drawn as a fourth option
 * pill, and the selection was marked in success-green on blurred pills.
 */
export function SelectLanguageBody({ onSelect, selectedLanguage, onContinue }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.content}>
      <View style={styles.iconWrap}>
        <Feather name="globe" size={28} color={Colors.brand} />
      </View>
      <Text style={styles.heading}>{t("language.chooseYourLanguage")}</Text>
      <Text style={styles.subheading}>{t("language.youCanChangeThisLaterFromYourProfile")}</Text>

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
                isSelected && styles.cardSelected,
                pressed && !isSelected && styles.cardPressed,
              ]}
            >
              <View style={[styles.glyph, isSelected && styles.glyphSelected]}>
                <Text style={[styles.glyphText, isSelected && styles.glyphTextSelected]}>{option.glyph}</Text>
              </View>
              <View style={styles.labels}>
                <Text style={styles.cardLabel} numberOfLines={1}>{option.nativeLabel}</Text>
                {option.nativeLabel !== option.englishLabel && (
                  <Text style={styles.cardSubLabel} numberOfLines={1}>{option.englishLabel}</Text>
                )}
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {onContinue && (
        <Button
          title={t("actions.continue")}
          onPress={onContinue}
          disabled={!selectedLanguage}
          style={styles.continue}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  iconWrap: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: Colors.brandSkin,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: typography.sizes.extraLarge,
    lineHeight: typography.lineHeights.extraLarge,
    textAlign: "center",
    marginBottom: 8,
    color: Colors.text,
    fontFamily: fontFamilies.heading.bold,
  },
  subheading: {
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
    textAlign: "center",
    marginBottom: 28,
    color: Colors.textSecondary,
    fontFamily: fontFamilies.body.regular,
  },
  options: {
    gap: 12,
  },
  card: {
    minHeight: 68,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  cardSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandSkin,
  },
  cardPressed: {
    backgroundColor: Colors.surfaceContainer,
  },
  glyph: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: Colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  glyphSelected: {
    backgroundColor: Colors.brand,
  },
  glyphText: {
    fontSize: typography.sizes.medium,
    color: Colors.text,
    fontFamily: fontFamilies.body.bold,
  },
  glyphTextSelected: {
    color: Colors.onBrand,
  },
  labels: {
    flex: 1,
  },
  cardLabel: {
    fontSize: typography.sizes.large,
    color: Colors.text,
    fontFamily: fontFamilies.body.semibold,
  },
  cardSubLabel: {
    fontSize: typography.sizes.small,
    color: Colors.textSecondary,
    fontFamily: fontFamilies.body.regular,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.brand,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: Colors.brand,
  },
  continue: {
    marginTop: 28,
  },
});
