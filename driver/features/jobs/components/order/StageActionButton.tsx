import React from "react";

import type { StyleProp, ViewStyle } from "react-native";
import { styles } from "../../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";
import { AppText } from "@/components/ui/AppText";

/** The primary "advance the job" button. Every stage ends with one; only the
 * label changes, so it was written out ten times before this. */
export function StageActionButton({
  label,
  onPress,
  disabled,
  children,
  style,
}: {
  /** Omitted when `children` supplies the contents. */
  label?: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  /** Custom contents in place of the plain label — e.g. an icon beside text. */
  children?: React.ReactNode;
  /** Per-stage overrides: a danger colour, extra spacing. */
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Touchable style={[styles.actionBtn, style]} onPress={onPress} disabled={disabled}>
      {children ?? <AppText style={styles.actionBtnText}>{label}</AppText>}
    </Touchable>
  );
}
