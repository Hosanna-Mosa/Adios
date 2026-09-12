import React from "react";
import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** Title + optional subtitle above a form section.
 * Was defined identically in both onboarding.tsx and identity-verify.tsx. */
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: typography.sizes.extraLarge, fontWeight: "700", color: Colors.text }}>{title}</Text>
      {subtitle && (
        <Text style={{ fontSize: typography.sizes.medium, color: Colors.textSecondary, marginTop: 4, lineHeight: typography.lineHeights.medium }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
