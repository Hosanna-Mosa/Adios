import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";
import { AppText } from "@/components/ui/AppText";

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
    <Touchable style={styles.checkRow} onPress={onToggle}>
      <Feather
        name={checked ? "check-square" : "square"}
        size={20}
        color={checked ? Colors.brand : Colors.textMuted}
      />
      <AppText
        style={[
          styles.checkText,
          emphasiseWhenChecked && checked ? styles.checkTextSelected : null,
        ]}
      >
        {label}
      </AppText>
    </Touchable>
  );
}
