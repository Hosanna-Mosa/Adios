import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { selectStyles } from "./SelectCard.styles";

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
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect();
      }}
      style={[
        selectStyles.card,
        selected && selectStyles.cardSelected,
      ]}
    >
      <View style={selectStyles.row}>
        {icon && (
          <View style={[selectStyles.iconWrap, selected && selectStyles.iconWrapSelected]}>
            <Feather
              name={icon}
              size={20}
              color={selected ? Colors.white : Colors.primary}
            />
          </View>
        )}
        <View style={selectStyles.textWrap}>
          <Text style={[selectStyles.label, selected && selectStyles.labelSelected]}>
            {label}
          </Text>
          {desc && (
            <Text style={[selectStyles.desc, selected && selectStyles.descSelected]}>
              {desc}
            </Text>
          )}
        </View>
        <View style={[selectStyles.radio, selected && selectStyles.radioSelected]}>
          {selected && <Feather name="check" size={14} color={Colors.white} />}
        </View>
      </View>
    </Pressable>
  );
}
