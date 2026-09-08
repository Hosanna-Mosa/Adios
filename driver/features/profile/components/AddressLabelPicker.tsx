import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../add-address.styles";

const ICON_FOR: Record<string, keyof typeof Feather.glyphMap> = {
  Home: "home",
  Work: "briefcase",
};

/** "Save as" chips — Home / Work / Other. */
export function AddressLabelPicker({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (label: string) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Save as</Text>
      <View style={styles.labelRow}>
        {options.map((opt) => {
          const isActive = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.labelChip, isActive && styles.labelChipActive]}
              onPress={() => onSelect(opt)}
            >
              <Feather
                name={ICON_FOR[opt] || "map-pin"}
                size={14}
                color={isActive ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.labelChipText, isActive && styles.labelChipTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
