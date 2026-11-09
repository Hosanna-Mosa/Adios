import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { PRIVACY, TERMS } from "../legalContent";

export type LegalDoc = "terms" | "privacy";

interface Props {
  doc: LegalDoc;
  onChangeDoc: (doc: LegalDoc) => void;
  insets: EdgeInsets;
  tokens: ThemeTokens;
}

/** Terms of Service / Privacy Policy, switched with a two-part toggle. */
export function LegalBody({ doc, onChangeDoc, insets, tokens }: Props) {
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const content = doc === "terms" ? TERMS : PRIVACY;
  const tabs: { id: LegalDoc; label: string }[] = [
    { id: "terms", label: t("app.legal.terms") },
    { id: "privacy", label: t("app.legal.privacy") },
  ];

  return (
    <>
      <View style={styles.toggle}>
        {tabs.map((tab) => {
          const active = tab.id === doc;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.toggleCell, active && styles.toggleCellActive]}
              onPress={() => onChangeDoc(tab.id)}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.updated}>{t("app.legal.lastUpdated", { date: content.updated })}</Text>
        <Text style={styles.paragraph}>{content.intro}</Text>
        {content.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.body.map((paragraph, idx) => (
              <Text key={idx} style={styles.paragraph}>{paragraph}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    toggle: { flexDirection: "row", marginHorizontal: 16, marginBottom: 8, padding: 4, borderRadius: 14, backgroundColor: tokens.sunken },
    toggleCell: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    toggleCellActive: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border },
    toggleText: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.sec },
    toggleTextActive: { color: tokens.text },
    body: { paddingHorizontal: 16, paddingTop: 12 },
    updated: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.small, color: tokens.muted, marginBottom: 12 },
    section: { marginTop: 18 },
    heading: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: tokens.text, marginBottom: 8 },
    paragraph: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.medium, lineHeight: typography.lineHeights.medium, color: tokens.sec, marginBottom: 10 },
  });
