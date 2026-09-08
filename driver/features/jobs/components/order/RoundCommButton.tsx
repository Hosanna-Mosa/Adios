import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";

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
    <TouchableOpacity style={styles.roundCommBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.brand} />
      {children}
    </TouchableOpacity>
  );
}
