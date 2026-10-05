import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { staggerListItem } from "@/motion/presets";

interface Props {
  items: { title: string; body: string }[];
}

/** Question/answer rows where one opens at a time — the customer app's FAQ card. */
export function Accordion({ items }: Props) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <View style={styles.card}>
      {items.map((item, idx) => {
        const expanded = open === idx;
        return (
          <Animated.View key={item.title} entering={staggerListItem(idx)}>
            <TouchableOpacity
              style={[styles.row, idx < items.length - 1 && styles.divider]}
              activeOpacity={0.7}
              onPress={() => setOpen(expanded ? null : idx)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
            >
              <View style={styles.head}>
                <Text style={styles.title}>{item.title}</Text>
                <Ionicons name={expanded ? "remove" : "add"} size={18} color={tokens.brand} />
              </View>
              {expanded ? <Text style={styles.body}>{item.body}</Text> : null}
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: radius.md, overflow: "hidden" },
    row: { padding: 14 },
    divider: { borderBottomWidth: 1, borderBottomColor: tokens.border },
    head: { flexDirection: "row", alignItems: "center", gap: 12 },
    title: { flex: 1, fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: tokens.text },
    body: {
      fontFamily: fontFamilies.body.regular,
      fontSize: typography.sizes.medium,
      lineHeight: typography.lineHeights.medium,
      color: tokens.sec,
      marginTop: 10,
    },
  });
