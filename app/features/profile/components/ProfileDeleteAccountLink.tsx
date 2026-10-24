import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { type ProfileStyles } from "../profile.styles";

/** Quiet link under "Sign out of all devices" to the account-deletion screen. */
export function ProfileDeleteAccountLink({ styles, disabled }: { styles: ProfileStyles; disabled: boolean }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.signOutAllBtn} onPress={() => router.push("/delete-account")} disabled={disabled} activeOpacity={0.8}>
      <Text style={styles.signOutAllBtnText}>{t("app.deleteAccount.title")}</Text>
    </TouchableOpacity>
  );
}
