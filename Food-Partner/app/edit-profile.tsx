import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { EditProfileForm } from "@/features/account/edit/components/EditProfileForm";
import { useEditProfile } from "@/features/account/edit/useEditProfile";

/** Edit restaurant details — the outlet's name, contact, address, branch code and location. */
export default function EditProfileScreen() {
  const { t } = useTranslation();
  const p = useEditProfile();
  const header = <Header title={t("editProfile.title")} onBack={() => router.back()} backDisabled={p.saving} />;

  if (p.loading) {
    return (
      <ScreenShell style={{ paddingTop: p.insets.top + 8 }} header={header}>
        <FullScreenLoader color={p.tokens.brand} style={{ flex: 1 }} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      keyboardAvoiding
      style={{ paddingTop: p.insets.top + 8 }}
      header={header}
      scroll
      contentStyle={p.styles.content}
      footer={<Button title={t("editProfile.save")} onPress={p.submit} loading={p.saving} disabled={p.locating} fullWidth />}
    >
      <EditProfileForm
        form={p.form}
        update={p.update}
        errors={p.errors}
        locating={p.locating}
        onCaptureLocation={p.captureLocation}
        onRemoveLocation={p.removeLocation}
        styles={p.styles}
        tokens={p.tokens}
      />
    </ScreenShell>
  );
}
