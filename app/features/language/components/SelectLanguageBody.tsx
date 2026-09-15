import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { fontFamilies, typography } from "@/constants/typography";
import type { ThemeTokens } from "@/constants/colors";
import type { SupportedLanguage } from "@/contexts/languageStore";

// Each option is labeled in its own native script — deliberately not run
// through t() — so a Telugu/Hindi speaker can find their language without
// first having to read English. See ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md,
// Section 7 ("First-Launch Language Flow").
const OPTIONS: { code: SupportedLanguage; nativeLabel: string }[] = [
  { code: "en", nativeLabel: "English" },
  { code: "te", nativeLabel: "తెలుగు" },
  { code: "hi", nativeLabel: "हिन्दी" },
];

interface Props {
  tokens: ThemeTokens;
  onSelect: (code: SupportedLanguage) => void;
  /** Currently selected language, used to highlight the matching option.
   * Omitted by language-settings.tsx, which keeps this component's original
   * unhighlighted, no-Continue behavior unchanged. */
  selectedLanguage?: SupportedLanguage | null;
  /** Present only on the language-gate screen (select-language.tsx). Renders
   * a Continue button — disabled until a language is selected — instead of
   * navigating the instant an option is tapped. */
  onContinue?: () => void;
}

export function SelectLanguageBody({ tokens, onSelect, selectedLanguage, onContinue }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.content}>
      <Text style={[styles.heading, { color: tokens.text, fontFamily: fontFamilies.heading.bold }]}>
        Choose your language
      </Text>
      <Text style={[styles.subheading, { color: tokens.sec, fontFamily: fontFamilies.body.regular }]}>
        You can change this later from your profile.
      </Text>
      <View style={styles.options}>
        {OPTIONS.map((option) => (
          <Button
            key={option.code}
            title={option.nativeLabel}
            onPress={() => onSelect(option.code)}
            variant={selectedLanguage === option.code ? "primary" : "secondary"}
            fullWidth
          />
        ))}
      </View>
      {onContinue && (
        <View style={styles.continueWrap}>
          <Button
            title={t("actions.continue")}
            onPress={onContinue}
            variant="primary"
            fullWidth
            disabled={!selectedLanguage}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: typography.sizes.extraLarge,
    lineHeight: typography.lineHeights.extraLarge,
    textAlign: "center",
    marginBottom: 8,
  },
  subheading: {
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
    textAlign: "center",
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
  continueWrap: {
    marginTop: 20,
  },
});
