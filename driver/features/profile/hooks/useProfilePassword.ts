import { useState } from "react";
import { Alert } from "react-native";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";

/** The change-password form on the profile tab. */
export function useProfilePassword() {
  const token = useDriverStore((s) => s.token);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!token) return;
    if (!currentPassword || !newPassword) {
      Alert.alert("Validation", "Fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Validation", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation", "Passwords do not match");
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
      if (!response.ok) throw new Error(data.message || "Failed to change password");

      Alert.alert("Success", "Password changed successfully.");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
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
