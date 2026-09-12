import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";

/** "Use PAN Card instead →" style link that jumps to the other ID method. */
export function AlternateIdLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: "center", paddingVertical: 10 }}>
      <Text style={{ fontSize: typography.sizes.medium, color: Colors.textMuted, fontWeight: "500" }}>{label}</Text>
    </TouchableOpacity>
  );
}
