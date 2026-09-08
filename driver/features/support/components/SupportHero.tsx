import React from "react";
import { Text, View } from "react-native";
import { styles } from "../support.styles";

/** Badge, headline and blurb at the top of the support screen. */
export function SupportHero({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>{badge}</Text>
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}
