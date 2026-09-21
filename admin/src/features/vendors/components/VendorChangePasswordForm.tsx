import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
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
  return (
    <FadeIn className="bg-card border border-border rounded-3xl p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Change Password</h2>
          <p className="text-sm text-muted-foreground">
            Update your account password. You'll be signed out after the change.
          </p>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="space-y-6">
        <VendorPasswordField
          label="Current Password"
          placeholder="Enter your current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          show={showCurrent}
          onToggleShow={() => setShowCurrent(!showCurrent)}
        />

        <VendorPasswordField
          label="New Password"
          placeholder="Enter new password (min. 6 characters)"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggleShow={() => setShowNew(!showNew)}
          hint={
            newPassword.length > 0 && newPassword.length < 6 && (
              <p className="text-xs text-destructive mt-1">Password must be at least 6 characters</p>
            )
          }
        />

        <VendorPasswordField
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggleShow={() => setShowConfirm(!showConfirm)}
          hint={
            confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive mt-1">Passwords do not match</p>
            )
          }
        />

        {/* Validation Checklist */}
        <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requirements</p>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${newPassword.length >= 6 ? "bg-success" : "bg-muted-foreground/30"}`} />
            <span className="text-sm text-muted-foreground">At least 6 characters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${newPassword === confirmPassword && confirmPassword.length > 0 ? "bg-success" : "bg-muted-foreground/30"}`} />
            <span className="text-sm text-muted-foreground">Passwords match</span>
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
              Changing Password...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </form>
    </FadeIn>
  );
}
