import React from "react";

import { modalActionStyles as styles } from "./ModalFormActions.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Cancel / confirm pair at the foot of an edit form.
 * The same row closed the profile, bank and password forms. */
export function ModalFormActions({
  onCancel,
  onConfirm,
  confirmLabel,
  busyLabel,
  busy,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  busyLabel: string;
  busy: boolean;
}) {
  return (
    <Box style={styles.editActions}>
      <PressBox style={styles.cancelBtn} onPress={onCancel}>
        <AppText style={styles.cancelBtnText}>Cancel</AppText>
      </PressBox>
      <PressBox
        style={[styles.saveBtn, busy && { opacity: 0.6 }]}
        onPress={onConfirm}
        disabled={busy}
      >
        <AppText style={styles.saveBtnText}>{busy ? busyLabel : confirmLabel}</AppText>
      </PressBox>
    </Box>
  );
}

/** Full-width outlined button that opens one of those forms. */
export function ModalActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <PressBox style={styles.editButton} onPress={onPress}>
      {icon}
      <AppText style={styles.editButtonText}>{label}</AppText>
    </PressBox>
  );
}
