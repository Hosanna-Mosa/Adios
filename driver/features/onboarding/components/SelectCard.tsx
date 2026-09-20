import React from "react";

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { selectStyles } from "./SelectCard.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Radio-style option card — vehicle type, gender, preferred zone. */
export function SelectCard({
  selected,
  onSelect,
  icon,
  label,
  desc,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: keyof typeof Feather.glyphMap;
  label: string;
  desc?: string;
}) {
  return (
    <PressBox
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
      style={[
        selectStyles.card,
        selected && selectStyles.cardSelected,
      ]}
    >
      <Box style={selectStyles.row}>
        {icon && (
          <Box style={[selectStyles.iconWrap, selected && selectStyles.iconWrapSelected]}>
            <Feather
              name={icon}
              size={20}
              color={selected ? Colors.white : Colors.primary}
            />
          </Box>
        )}
        <Box style={selectStyles.textWrap}>
          <AppText style={[selectStyles.label, selected && selectStyles.labelSelected]}>
            {label}
          </AppText>
          {desc && (
            <AppText style={[selectStyles.desc, selected && selectStyles.descSelected]}>
              {desc}
            </AppText>
          )}
        </Box>
        <Box style={[selectStyles.radio, selected && selectStyles.radioSelected]}>
          {selected && <Feather name="check" size={14} color={Colors.white} />}
        </Box>
      </Box>
    </PressBox>
  );
}
