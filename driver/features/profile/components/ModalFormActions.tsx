import React from "react";
import { Pressable, Text, View } from "react-native";
import { modalActionStyles as styles } from "./ModalFormActions.styles";

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
    <View style={styles.editActions}>
      <Pressable style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </Pressable>
      <Pressable
        style={[styles.saveBtn, busy && { opacity: 0.6 }]}
        onPress={onConfirm}
        disabled={busy}
      >
        <Text style={styles.saveBtnText}>{busy ? busyLabel : confirmLabel}</Text>
      </Pressable>
    </View>
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
    <Pressable style={styles.editButton} onPress={onPress}>
      {icon}
      <Text style={styles.editButtonText}>{label}</Text>
    </Pressable>
  );
}
