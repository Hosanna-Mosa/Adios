import { VendorLayout } from "@/components/layout/VendorLayout";
import { useVendorPasswordChange } from "@/features/vendors/hooks/useVendorPasswordChange";
import { VendorChangePasswordForm } from "@/features/vendors/components/VendorChangePasswordForm";

export default function VendorSettings() {
  const { isMeatVendor, ...formProps } = useVendorPasswordChange();

  return (
    <VendorLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your {isMeatVendor ? "meat center" : "vendor"} account settings.
          </p>
        </div>

        <VendorChangePasswordForm {...formProps} />

        <div className="bg-muted/30 p-6 rounded-2xl">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> After changing your password, you'll be signed out and redirected to the login page to sign in with your new credentials.
          </p>
        </div>
      </div>
    </VendorLayout>
  );
}
