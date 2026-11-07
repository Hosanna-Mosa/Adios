import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { DeleteAccountBody } from "@/features/profile/components/DeleteAccountBody";
import { useDeleteAccount } from "@/features/profile/useDeleteAccount";

// Permanently deletes the signed-in customer's account. Reached from Profile.
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { tokens, styles, password, setPassword, deleting, confirmDelete } = useDeleteAccount();

  return (
    <ScreenShell keyboardAvoiding style={{ paddingTop: insets.top }}>
      <Header title={t("app.deleteAccount.title")} onBack={() => router.back()} style={{ paddingTop: 12, paddingBottom: 12 }} />
      <DeleteAccountBody
        confirmDelete={confirmDelete}
        deleting={deleting}
        insets={insets}
        password={password}
        setPassword={setPassword}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
