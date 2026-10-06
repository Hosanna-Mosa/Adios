import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";

interface Props {
  text: string;
  /** Bold words before the text, e.g. "Your daily controls:". */
  lead?: string;
  tone?: "info" | "warning";
  style?: StyleProp<ViewStyle>;
}

/** A tinted explanatory note with an icon — e.g. "you'll be signed out after…". */
export function InfoNote({ text, lead, tone = "info", style }: Props) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const fg = tone === "info" ? tokens.info : tokens.warning;
  const bg = tone === "info" ? tokens.infoSkin : tokens.warningSkin;
  return (
    <View style={[styles.note, { backgroundColor: bg }, style]}>
      <Ionicons name={tone === "info" ? "information-circle" : "time-outline"} size={18} color={fg} />
      <Text style={styles.text}>
        {lead ? <Text style={styles.lead}>{lead} </Text> : null}
        {text}
      </Text>
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    note: { flexDirection: "row", gap: 10, borderRadius: radius.md, padding: 14 },
    text: {
      flex: 1,
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.small,
      lineHeight: typography.lineHeights.small,
      color: tokens.sec,
    },
    lead: { fontFamily: fontFamilies.body.bold, color: tokens.text },
  });
