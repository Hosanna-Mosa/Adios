import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";

/** "Use PAN Card instead →" style link that jumps to the other ID method. */
export function AlternateIdLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: "center", paddingVertical: 10 }}>
      <Text style={{ fontSize: 14, color: Colors.textMuted, fontWeight: "500" }}>{label}</Text>
    </TouchableOpacity>
  );
}
