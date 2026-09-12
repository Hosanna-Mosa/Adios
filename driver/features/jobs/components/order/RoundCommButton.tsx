import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";

/** Round call / chat / navigate button beside a stop.
 * Appeared eleven times across the job stages. `children` carries the unread
 * badge on the chat variant. */
export function RoundCommButton({
  icon,
  onPress,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Touchable style={styles.roundCommBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.brand} />
      {children}
    </Touchable>
  );
}
