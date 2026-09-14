import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
}

export function SelectLanguageBody({ tokens, onSelect }: Props) {
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
            variant="secondary"
            fullWidth
          />
        ))}
      </View>
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
});
