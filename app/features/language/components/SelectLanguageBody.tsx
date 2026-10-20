import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Button } from "@/components/ui/Button";
import { radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { fadeInDown, staggerListItem } from "@/motion/presets";
import type { SupportedLanguage } from "@/contexts/languageStore";

// Each option is labeled in its own native script — deliberately not run
// through t() — so a Telugu/Hindi speaker can find their language without
// first having to read English. See ADIOS_MULTILINGUAL_DEVELOPMENT_PLAN.md,
// Section 7 ("First-Launch Language Flow").
const OPTIONS: { code: SupportedLanguage; nativeLabel: string; englishLabel: string; glyph: string }[] = [
  { code: "en", nativeLabel: "English", englishLabel: "English", glyph: "A" },
  { code: "te", nativeLabel: "తెలుగు", englishLabel: "Telugu", glyph: "అ" },
  { code: "hi", nativeLabel: "हिन्दी", englishLabel: "Hindi", glyph: "अ" },
];

interface Props {
  tokens: ThemeTokens;
  /** Kept for callers; the cards no longer use a blur. */
  theme: "light" | "dark";
  onSelect: (code: SupportedLanguage) => void;
  /** Currently selected language — highlights the matching card. */
  selectedLanguage?: SupportedLanguage | null;
  /** Present only on the language-gate screen (select-language.tsx). Renders
   * a Continue button — disabled until a language is selected — instead of
   * navigating the instant an option is tapped. */
  onContinue?: () => void;
  /** language-settings.tsx draws its own header with a back button. */
  showHero?: boolean;
}

export function SelectLanguageBody({ tokens, onSelect, selectedLanguage, onContinue, showHero = true }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const accent = tokens.brand;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: showHero ? insets.top + 40 : 8 }]} showsVerticalScrollIndicator={false}>
        {showHero && (
          <Animated.View entering={fadeInDown(0)} style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="language" size={34} color={accent} />
            </View>
            {/* Re-renders in the tapped language, so the choice is confirmed in that language. */}
            <Text style={styles.heading}>{t("app.language.chooseYourLanguage")}</Text>
            <Text style={styles.subheading}>{t("app.language.changeLater")}</Text>
          </Animated.View>
        )}

        <View style={styles.options}>
          {OPTIONS.map((option, idx) => {
            const isSelected = selectedLanguage === option.code;
            return (
              <Animated.View key={option.code} entering={staggerListItem(idx)}>
                <Pressable
                  onPress={() => onSelect(option.code)}
                  style={({ pressed }) => [styles.card, isSelected && styles.cardSelected, pressed && styles.cardPressed]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={option.code === "en" ? option.nativeLabel : `${option.nativeLabel}, ${option.englishLabel}`}
                >
                  <View style={[styles.glyphTile, isSelected && styles.glyphTileSelected]}>
                    <Text style={[styles.glyph, isSelected && styles.glyphSelected]}>{option.glyph}</Text>
                  </View>
                  <View style={styles.labels}>
                    <Text style={styles.nativeLabel}>{option.nativeLabel}</Text>
                    {option.code !== "en" && <Text style={styles.englishLabel}>{option.englishLabel}</Text>}
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={tokens.onBrand} />}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {onContinue && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button title={t("actions.continue")} onPress={onContinue} disabled={!selectedLanguage} fullWidth />
        </View>
      )}
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    root: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingBottom: 24 },
    hero: { alignItems: "center", marginBottom: 32 },
    heroIcon: {
      width: 72, height: 72, borderRadius: radius.lg, backgroundColor: tokens.brandSkin,
      alignItems: "center", justifyContent: "center", marginBottom: 20,
    },
    heading: {
      fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.extraLarge, lineHeight: typography.lineHeights.extraLarge,
      color: tokens.text, textAlign: "center", marginBottom: 8,
    },
    subheading: {
      fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium,
      color: tokens.sec, textAlign: "center",
    },
    options: { gap: 12 },
    card: {
      flexDirection: "row", alignItems: "center", gap: 14, minHeight: 76, paddingHorizontal: 14, paddingVertical: 12,
      borderRadius: radius.md, borderWidth: 1.5, borderColor: tokens.border, backgroundColor: tokens.surface,
    },
    cardSelected: { borderColor: tokens.brand, backgroundColor: tokens.brandSkin },
    cardPressed: { opacity: 0.85 },
    glyphTile: {
      width: 48, height: 48, borderRadius: radius.sm, backgroundColor: tokens.sunken,
      alignItems: "center", justifyContent: "center",
    },
    glyphTileSelected: { backgroundColor: tokens.brand },
    glyph: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.large, color: tokens.sec },
    glyphSelected: { color: tokens.onBrand },
    labels: { flex: 1, minWidth: 0 },
    nativeLabel: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.large, color: tokens.text },
    englishLabel: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, color: tokens.muted, marginTop: 2 },
    radio: {
      width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: tokens.borderStrong,
      alignItems: "center", justifyContent: "center",
    },
    radioSelected: { borderColor: tokens.brand, backgroundColor: tokens.brand },
    footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.border, backgroundColor: tokens.surface },
  });
