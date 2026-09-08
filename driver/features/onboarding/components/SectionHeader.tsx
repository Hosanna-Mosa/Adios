import React from "react";
import { Text, View } from "react-native";
import { Colors } from "@/constants/colors";

/** Title + optional subtitle above a form section.
 * Was defined identically in both onboarding.tsx and identity-verify.tsx. */
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: Colors.text }}>{title}</Text>
      {subtitle && (
        <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4, lineHeight: 20 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
