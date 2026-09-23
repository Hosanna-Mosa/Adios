import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Colors, radius } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import type { SupportedLanguage } from "@/store/languageStore";

// Each option is labeled in its own native script — deliberately not run
// through t() — so a Telugu/Hindi speaker can find their language without
// first having to read English. Mirrors app/features/language's pattern.
const OPTIONS: { code: SupportedLanguage; nativeLabel: string }[] = [
  { code: "en", nativeLabel: "English" },
  { code: "te", nativeLabel: "తెలుగు" },
  { code: "hi", nativeLabel: "हिन्दी" },
];

interface Props {
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

export function SelectLanguageBody({ onSelect, selectedLanguage, onContinue }: Props) {
  const { t } = useTranslation();
  const canContinue = !!selectedLanguage;

  return (
    <View style={styles.content}>
      <Text style={styles.heading}>{t("language.chooseYourLanguage")}</Text>
      <Text style={styles.subheading}>{t("language.youCanChangeThisLaterFromYourProfile")}</Text>
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = selectedLanguage === option.code;
          return (
            <Pressable
              key={option.code}
              onPress={() => onSelect(option.code)}
              style={[styles.card, { borderColor: isSelected ? Colors.success : Colors.border }]}
            >
              <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFillObject} />
              <Text style={styles.cardLabel}>{option.nativeLabel}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={22} color={Colors.success} />}
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
            { borderColor: canContinue ? Colors.success : Colors.border, opacity: canContinue ? 1 : 0.5 },
          ]}
        >
          <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFillObject} />
          <Text style={[styles.cardLabel, { fontFamily: fontFamilies.body.bold }]}>{t("actions.continue")}</Text>
          {canContinue && <Ionicons name="checkmark-circle" size={22} color={Colors.success} />}
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
    color: Colors.text,
    fontFamily: fontFamilies.heading.bold,
  },
  subheading: {
    fontSize: typography.sizes.medium,
    lineHeight: typography.lineHeights.medium,
    textAlign: "center",
    marginBottom: 32,
    color: Colors.textSecondary,
    fontFamily: fontFamilies.body.regular,
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
    color: Colors.text,
    fontFamily: fontFamilies.body.semibold,
  },
  continueCard: {
    marginTop: 20,
  },
});
