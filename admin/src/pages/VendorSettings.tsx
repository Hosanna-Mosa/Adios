import { useTranslation } from "react-i18next";
import { VendorLayout } from "@/components/layout/VendorLayout";
import { useVendorPasswordChange } from "@/features/vendors/hooks/useVendorPasswordChange";
import { VendorChangePasswordForm } from "@/features/vendors/components/VendorChangePasswordForm";

export default function VendorSettings() {
  const { t } = useTranslation();
  const { isMeatVendor, ...formProps } = useVendorPasswordChange();

  return (
    <VendorLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("vendorSettings.settings")}</h1>
          <p className="text-muted-foreground">
            {t("vendorSettings.manageAccountSettings", {
              role: isMeatVendor ? t("vendorDashboard.meatCenterLower") : t("vendorDashboard.vendorLower"),
              defaultValue: "Manage your {{role}} account settings.",
            })}
          </p>
        </div>

        <VendorChangePasswordForm {...formProps} />

        <div className="bg-muted/30 p-6 rounded-2xl">
          <p className="text-sm text-muted-foreground">
            <strong>{t("vendorSettings.noteColon")}</strong> {t("vendorSettings.passwordChangeSignsYouOut")}
          </p>
        </div>
      </div>
    </VendorLayout>
  );
}
