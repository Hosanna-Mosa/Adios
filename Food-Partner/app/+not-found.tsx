import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenShell } from "@/components/ui/ScreenShell";

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <ScreenShell style={{ justifyContent: "center" }}>
      <EmptyState icon="compass-outline" title={t("errors.pageNotFound")} actionLabel={t("actions.goHome")} onAction={() => router.replace("/")} />
    </ScreenShell>
  );
}
