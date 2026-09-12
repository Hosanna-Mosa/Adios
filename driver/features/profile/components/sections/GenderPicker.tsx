import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { modalStyles } from "../../profile-tab.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
      <AppText style={modalStyles.fieldLabel}>Gender</AppText>
      <Box style={modalStyles.genderRow}>
        {options.map((g) => {
          const active = selected === g.id;
          return (
            <Touchable
              key={g.id}
              style={[modalStyles.genderOption, active && modalStyles.genderOptionActive]}
              onPress={() => onSelect(g.id)}
              activeOpacity={0.7}
            >
              <Feather name={g.icon} size={16} color={active ? Colors.white : Colors.textMuted} />
              <AppText style={[modalStyles.genderText, active && modalStyles.genderTextActive]}>
                {g.label}
              </AppText>
            </Touchable>
          );
        })}
      </Box>
    </>
  );
}
