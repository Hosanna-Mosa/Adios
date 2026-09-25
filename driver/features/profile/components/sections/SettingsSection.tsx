import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import type { Field } from "../../utils/format";
import { modalStyles } from "../../profile-tab.styles";
import { EditField } from "../EditField";
import { FieldRow } from "../FieldRow";
import { ModalActionButton, ModalFormActions } from "../ModalFormActions";
import { SectionFieldRows } from "../SectionFieldRows";
import { Box } from "@/components/ui/Box";

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
  const { t } = useTranslation();
  return (
    <Box>
      <SectionFieldRows fields={fields} />
      {addresses.map((address, index) => (
        <FieldRow
          key={`${address.label}-${index}`}
          label={t("profile.addressN", { value: index + 1, defaultValue: "Address {{value}}" })}
          value={`${address.label}: ${address.addressLine}`}
        />
      ))}

      {showPasswordForm ? (
        <Box style={modalStyles.passwordForm}>
          <EditField
            label={t("profile.currentPassword")}
            value={currentPassword}
            onChangeText={onCurrentPasswordChange}
            icon="lock"
            placeholder={t("profile.enterCurrentPassword")}
            secureTextEntry
          />
          <EditField
            label={t("profile.newPassword")}
            value={newPassword}
            onChangeText={onNewPasswordChange}
            icon="lock"
            placeholder={t("profile.atLeast6Characters")}
            secureTextEntry
          />
          <EditField
            label={t("profile.confirmNewPassword")}
            value={confirmPassword}
            onChangeText={onConfirmPasswordChange}
            icon="check-square"
            placeholder={t("profile.reEnterNewPassword")}
            secureTextEntry
          />
          <ModalFormActions
            onCancel={onCancel}
            onConfirm={onSubmit}
            confirmLabel={t("profile.updatePassword")}
            busyLabel={t("profile.updating")}
            busy={isSaving}
          />
        </Box>
      ) : (
        <ModalActionButton
          icon={<Feather name="lock" size={15} color={Colors.primary} />}
          label={t("profile.changePassword")}
          onPress={onOpenForm}
        />
      )}
    </Box>
  );
}
