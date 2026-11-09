import React from "react";
import { useTranslation } from "react-i18next";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";

// What a screen reader says for each icon this button is used with.
const LABELS: Partial<Record<keyof typeof Ionicons.glyphMap, string>> = {
  call: "a11y.call",
  "chatbubble-ellipses": "a11y.chat",
  navigate: "a11y.navigate",
  location: "a11y.navigate",
};

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
  const { t } = useTranslation();
  return (
    <Touchable accessibilityLabel={t(LABELS[icon] ?? "a11y.contact")} hitSlop={8} style={styles.roundCommBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.brand} />
      {children}
    </Touchable>
  );
}
