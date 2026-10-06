import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { fadeInUp } from "@/motion/presets";
import { SectionHeader } from "./SectionHeader";

interface Props {
  title?: string;
  children: React.ReactNode;
  /** Rows sit in one bordered card (settings style) instead of separate cards. */
  grouped?: boolean;
  /** Stagger delay for the entrance animation. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** A labelled section of ListRows — the Account and Help screens are built from these. */
export function ListGroup({ title, children, grouped = true, delay = 0, style }: Props) {
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = React.useMemo(() => createStyles(tokens), [tokens]);
  return (
    <Animated.View entering={fadeInUp(delay)} style={[styles.section, style]}>
      {title ? <SectionHeader title={title} /> : null}
      <View style={grouped ? styles.group : styles.stack}>{children}</View>
    </Animated.View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    section: { marginTop: 24 },
    group: { backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.border, borderRadius: radius.lg, overflow: "hidden" },
    stack: { gap: 10 },
  });
