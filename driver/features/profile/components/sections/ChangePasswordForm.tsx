import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { modalStyles } from "../../profile-tab.styles";
import { EditField } from "../EditField";
import { ModalActionButton, ModalFormActions } from "../ModalFormActions";
import { Box } from "@/components/ui/Box";

/** Change-password control shown under Personal Info — moved there from the
 * removed standalone Settings section, which existed only to hold it. */
export function ChangePasswordForm({
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

  if (!showPasswordForm) {
    return (
      <ModalActionButton
        icon={<Feather name="lock" size={15} color={Colors.primary} />}
        label={t("profile.changePassword")}
        onPress={onOpenForm}
      />
    );
  }

  return (
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
  );
}
