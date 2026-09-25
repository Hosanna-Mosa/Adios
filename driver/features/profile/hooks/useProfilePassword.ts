import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";

/** The change-password form on the profile tab. */
export function useProfilePassword() {
  const { t } = useTranslation();
  const token = useDriverStore((s) => s.token);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!token) return;
    if (!currentPassword || !newPassword) {
      Alert.alert(t("profile.validation"), t("profile.fillInAllPasswordFields"));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t("profile.validation"), t("auth.passwordMustBeAtLeast6Characters"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("profile.validation"), t("auth.pleaseMakeSureBothPasswordsMatch"));
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch(`${apiUrl}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t("profile.failedToChangePassword"));

      Alert.alert(t("profile.success"), t("profile.passwordChangedSuccessfully"));
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert(t("auth.errorTitle"), error.message || t("profile.failedToChangePassword"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ── Add bank account ─────────────────────────────────────────────────────

  return {
    showPasswordForm, setShowPasswordForm,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    isSavingPassword, handleChangePassword,
  };
}
