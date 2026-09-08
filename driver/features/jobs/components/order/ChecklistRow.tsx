import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";

/** Tick-box line in the pickup checklist. */
export function ChecklistRow({
  checked,
  label,
  onToggle,
  emphasiseWhenChecked,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
  /** Order items dim their text once ticked; safety checks do not. */
  emphasiseWhenChecked?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle}>
      <Feather
        name={checked ? "check-square" : "square"}
        size={20}
        color={checked ? Colors.brand : Colors.textMuted}
      />
      <Text
        style={[
          styles.checkText,
          emphasiseWhenChecked && checked ? styles.checkTextSelected : null,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
