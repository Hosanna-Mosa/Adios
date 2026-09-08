import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { EditField } from "../EditField";
import { FieldRow } from "../FieldRow";
import { ModalActionButton, ModalFormActions } from "../ModalFormActions";
import { SectionFieldRows } from "../SectionFieldRows";

export interface SavedAddress {
  label: string;
  addressLine: string;
}

/** Account settings: saved addresses, plus the change-password form. */
export function SettingsSection({
  fields,
  addresses,
  showPasswordForm,
  currentPassword,
  onCurrentPasswordChange,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  isSaving,
  onOpenForm,
  onCancel,
  onSubmit,
}: {
  fields: Field[];
  addresses: SavedAddress[];
  showPasswordForm: boolean;
  currentPassword: string;
  onCurrentPasswordChange: (t: string) => void;
  newPassword: string;
  onNewPasswordChange: (t: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (t: string) => void;
  isSaving: boolean;
  onOpenForm: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <View>
      <SectionFieldRows fields={fields} />
      {addresses.map((address, index) => (
        <FieldRow
          key={`${address.label}-${index}`}
          label={`Address ${index + 1}`}
          value={`${address.label}: ${address.addressLine}`}
        />
      ))}

      {showPasswordForm ? (
        <View style={modalStyles.passwordForm}>
          <EditField
            label="Current Password"
            value={currentPassword}
            onChangeText={onCurrentPasswordChange}
            icon="lock"
            placeholder="Enter current password"
            secureTextEntry
          />
          <EditField
            label="New Password"
            value={newPassword}
            onChangeText={onNewPasswordChange}
            icon="lock"
            placeholder="At least 6 characters"
            secureTextEntry
          />
          <EditField
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            icon="check-square"
            placeholder="Re-enter new password"
            secureTextEntry
          />
          <ModalFormActions
            onCancel={onCancel}
            onConfirm={onSubmit}
            confirmLabel="Update Password"
            busyLabel="Updating..."
            busy={isSaving}
          />
        </View>
      ) : (
        <ModalActionButton
          icon={<Feather name="lock" size={15} color={Colors.primary} />}
          label="Change Password"
          onPress={onOpenForm}
        />
      )}
    </View>
  );
}
