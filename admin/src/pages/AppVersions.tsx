import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StaggerList } from "@/components/motion/StaggerList";
import { RefreshCw } from "lucide-react";
import { useAppVersions } from "@/features/system/hooks/useAppVersions";
import { PlatformVersionCard } from "@/features/system/components/PlatformVersionCard";

export default function AppVersions() {
  const { t } = useTranslation();
  const { ios, setIos, android, setAndroid, isLoading, handleSave, isSaving } = useAppVersions();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">{t("system.appVersionManagement")}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{t("system.controlUpdatePromptsDesc")}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" /> {t("system.loadingVersionSettings")}
          </div>
        ) : (
          <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlatformVersionCard
              iconBgClassName="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500"
              title={t("system.appleIosApplication")}
              subtitle={t("system.manageIosBuildsDesc")}
              storeLabel={t("system.appStoreUrl")}
              storePlaceholder="https://apps.apple.com/app/adios/..."
              config={ios}
              onChange={setIos}
              onSave={() => handleSave("ios")}
              isSaving={isSaving}
              buttonClassName="rounded-xl w-full"
              buttonLabel={t("system.saveIosConfiguration")}
            />

            <PlatformVersionCard
              iconBgClassName="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"
              title={t("system.googleAndroidApplication")}
              subtitle={t("system.manageAndroidBuildsDesc")}
              storeLabel={t("system.playStoreUrl")}
              storePlaceholder="https://play.google.com/store/apps/..."
              config={android}
              onChange={setAndroid}
              onSave={() => handleSave("android")}
              isSaving={isSaving}
              buttonClassName="rounded-xl w-full bg-emerald-600 hover:bg-emerald-700"
              buttonLabel={t("system.saveAndroidConfiguration")}
            />
          </StaggerList>
        )}
      </div>
    </DashboardLayout>
  );
}
