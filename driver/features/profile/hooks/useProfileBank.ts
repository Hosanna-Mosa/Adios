import { useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";

/** Adding a payout account from the profile tab. */
export function useProfileBank(onSaved: () => void) {
  const { t } = useTranslation();
  const token = useDriverStore((s) => s.token);
  const [showBankForm, setShowBankForm] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState("");
  const [newBankIfsc, setNewBankIfsc] = useState("");
  const [isSavingBank, setIsSavingBank] = useState(false);

  const handleAddBankAccount = async () => {
    if (!token) return;
    if (newBankAccount.length < 9 || newBankIfsc.length < 8) {
      Alert.alert(t("profile.validation"), t("profile.enterValidBankAccountAndIfsc"));
      return;
    }

    setIsSavingBank(true);
    try {
      // Use the onboarding PATCH endpoint to add a bank account
      const response = await fetch(`${apiUrl}/onboarding`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankAccountNumber: newBankAccount,
          bankIfsc: newBankIfsc,
          bankVerified: false,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || t("profile.failedToAddBankAccount"));
      }

      // Reload profile to show new account
      onSaved();
      setShowBankForm(false);
      setNewBankAccount("");
      setNewBankIfsc("");
      Alert.alert(t("profile.added"), t("profile.bankAccountAddedSuccessfully"));
    } catch (error: any) {
      Alert.alert(t("auth.errorTitle"), error.message || t("profile.failedToAddBankAccount"));
    } finally {
      setIsSavingBank(false);
    }
  };

  // ── Handle selecting gender in edit mode ─────────────────────────────────

  return {
    showBankForm, setShowBankForm,
    newBankAccount, setNewBankAccount,
    newBankIfsc, setNewBankIfsc,
    isSavingBank, handleAddBankAccount,
  };
}
