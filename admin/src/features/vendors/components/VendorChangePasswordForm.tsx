import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";
import { VendorPasswordField } from "./VendorPasswordField";
import type { useVendorPasswordChange } from "../hooks/useVendorPasswordChange";

type VendorChangePasswordFormProps = ReturnType<typeof useVendorPasswordChange>;

/** The "Change Password" card on VendorSettings.tsx. */
export function VendorChangePasswordForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isLoading,
  showCurrent,
  setShowCurrent,
  showNew,
  setShowNew,
  showConfirm,
  setShowConfirm,
  handleChangePassword,
}: VendorChangePasswordFormProps) {
  const { t } = useTranslation();
  return (
    <FadeIn className="bg-card border border-border rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("vendorSettings.changePassword")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("vendorSettings.updateAccountPasswordDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-6">
        <VendorPasswordField
          label={t("vendorSettings.currentPassword")}
          placeholder={t("vendorSettings.enterCurrentPassword")}
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggleShow={() => setShowCurrent(!showCurrent)}
        />

        <VendorPasswordField
          label={t("vendorSettings.newPassword")}
          placeholder={t("vendorSettings.enterNewPasswordMin6")}
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggleShow={() => setShowNew(!showNew)}
          hint={
            newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-xs text-destructive mt-1">{t("vendorAuth.passwordMustBeAtLeast6Characters")}</p>
            )
          }
        />

        <VendorPasswordField
          label={t("vendorSettings.confirmNewPassword")}
          placeholder={t("vendorAuth.reEnterNewPassword")}
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggleShow={() => setShowConfirm(!showConfirm)}
          hint={
            confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive mt-1">{t("vendorAuth.passwordsDoNotMatch")}</p>
            )
          }
        />

        {/* Validation Checklist */}
        <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("vendorSettings.requirements")}</p>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${newPassword.length >= 6 ? "bg-success" : "bg-muted-foreground/30"}`} />
            <span className="text-sm text-muted-foreground">{t("vendorSettings.atLeast6Characters")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${newPassword === confirmPassword && confirmPassword.length > 0 ? "bg-success" : "bg-muted-foreground/30"}`} />
            <span className="text-sm text-muted-foreground">{t("vendorSettings.passwordsMatch")}</span>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {t("vendorSettings.changingPasswordEllipsis")}
            </>
          ) : (
            t("vendorSettings.changePassword")
          )}
        </Button>
      </form>
    </FadeIn>
  );
}
