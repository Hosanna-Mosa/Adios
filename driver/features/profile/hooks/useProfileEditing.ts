import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";

/** The edit-profile form: opening it from the current values, and saving. */
export function useProfileEditing(profile: any, onSaved: () => void) {
  const { t } = useTranslation();
  const token = useDriverStore((s) => s.token);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGender, setEditGender] = useState<string | null>(null);

  const handleGenderSelect = (gender: string) => setEditGender(gender);

  const handleStartEditing = () => {
    if (!profile) return;
    setEditName(profile.account.name || "");
    setEditUsername(profile.account.username || "");
    setEditEmail(profile.account.email || "");
    setEditPhone(profile.account.phone || "");
    setEditGender(profile.driver?.gender || null);
    setIsEditing(true);
  };

  // ── Save edited personal info ────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!token) return;
    if (!editName.trim()) {
      Alert.alert(t("profile.validation"), t("profile.nameIsRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const body: Record<string, string> = { name: editName.trim() };
      if (editUsername.trim()) body.username = editUsername.trim();
      if (editEmail.trim()) body.email = editEmail.trim();
      if (editPhone.trim()) body.phone = editPhone.trim();
      if (editGender) body.gender = editGender;

      const response = await fetch(`${apiUrl}/drivers/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || t("profile.failedToUpdateProfile"));

      onSaved();
      setIsEditing(false);
      Alert.alert(t("profile.saved"), t("profile.profileUpdatedSuccessfully"));
    } catch (error: any) {
      Alert.alert(t("auth.errorTitle"), error.message || t("profile.failedToSaveChanges"));
    } finally {
      setIsSaving(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────────────

  return {
    isEditing, setIsEditing, isSaving,
    editName, setEditName, editUsername, setEditUsername,
    editEmail, setEditEmail, editPhone, setEditPhone,
    editGender, handleGenderSelect,
    handleStartEditing, handleSaveProfile,
  };
}
