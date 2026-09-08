import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { modalStyles } from "../../profile-tab.styles";

export interface GenderOption {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

/** Row of gender choices in the personal-info form. */
export function GenderPicker({
  options,
  selected,
  onSelect,
}: {
  options: GenderOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <Text style={modalStyles.fieldLabel}>Gender</Text>
      <View style={modalStyles.genderRow}>
        {options.map((g) => {
          const active = selected === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={[modalStyles.genderOption, active && modalStyles.genderOptionActive]}
              onPress={() => onSelect(g.id)}
              activeOpacity={0.7}
            >
              <Feather name={g.icon} size={16} color={active ? Colors.white : Colors.textMuted} />
              <Text style={[modalStyles.genderText, active && modalStyles.genderTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
