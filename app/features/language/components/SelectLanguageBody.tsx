import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeBlurView } from "@/components/ui/SafeBlurView";
import { Ionicons } from "@expo/vector-icons";
import { radius } from "@/constants/colors";
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
  /** Used only to pick the BlurView tint that matches the app's own theme —
   * the same pattern components/AppTabBar.tsx already uses for its frosted
   * bars. */
  theme: "light" | "dark";
  onSelect: (code: SupportedLanguage) => void;
  /** Currently selected language — shows a green checkmark on the matching
   * option. Omitted by language-settings.tsx, which keeps this component's
   * original no-checkmark, no-Continue behavior unchanged. */
  selectedLanguage?: SupportedLanguage | null;
  /** Present only on the language-gate screen (select-language.tsx). Renders
   * a Continue row — disabled until a language is selected — instead of
   * navigating the instant an option is tapped. */
  onContinue?: () => void;
}

export function SelectLanguageBody({ tokens, theme, onSelect, selectedLanguage, onContinue }: Props) {
  const { t } = useTranslation();
  const blurTint = theme === "dark" ? "dark" : "light";
  const canContinue = !!selectedLanguage;

  return (
    <View style={styles.content}>
      <Text style={[styles.heading, { color: tokens.text, fontFamily: fontFamilies.heading.bold }]}>
        Choose your language
      </Text>
      <Text style={[styles.subheading, { color: tokens.sec, fontFamily: fontFamilies.body.regular }]}>
        You can change this later from your profile.
      </Text>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = selectedLanguage === option.code;
          return (
            <Pressable
              key={option.code}
              onPress={() => onSelect(option.code)}
              style={[styles.card, { borderColor: isSelected ? tokens.success : tokens.border }]}
            >
              <SafeBlurView intensity={60} tint={blurTint} style={StyleSheet.absoluteFillObject} />
              <Text style={[styles.cardLabel, { color: tokens.text, fontFamily: fontFamilies.body.semibold }]}>
                {option.nativeLabel}
              </Text>
              {isSelected && <Ionicons name="checkmark-circle" size={22} color={tokens.success} />}
            </Pressable>
          );
        })}
      </View>
      {onContinue && (
        <Pressable
          onPress={canContinue ? onContinue : undefined}
          disabled={!canContinue}
          style={[
            styles.card,
            styles.continueCard,
            { borderColor: canContinue ? tokens.success : tokens.border, opacity: canContinue ? 1 : 0.5 },
          ]}
        >
          <SafeBlurView intensity={60} tint={blurTint} style={StyleSheet.absoluteFillObject} />
          <Text style={[styles.cardLabel, { color: tokens.text, fontFamily: fontFamilies.body.bold }]}>
            {t("actions.continue")}
          </Text>
          {canContinue && <Ionicons name="checkmark-circle" size={22} color={tokens.success} />}
        </Pressable>
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
  card: {
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  cardLabel: {
    fontSize: typography.sizes.large,
  },
  continueCard: {
    marginTop: 20,
  },
});
