import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { UserProfileForm } from "../userDetailTypes";

const ROLE_LABEL_KEY: Record<string, string> = {
  USER: "users.roleUser",
  DRIVER: "users.roleDriver",
  ADMIN: "users.roleAdmin",
};

interface UserEditFormProps {
  form: UserProfileForm;
  onChange: (form: UserProfileForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

/** The "Edit Account Details" form panel on UserDetail. */
export function UserEditForm({ form, onChange, onSubmit, isSaving }: UserEditFormProps) {
  const { t } = useTranslation();
  return (
    <div className="lg:col-span-1 bg-card border border-border p-6 rounded-3xl space-y-6 shadow-sm h-fit">
      <h3 className="text-lg font-bold text-foreground">{t("users.editAccountDetails")}</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t("users.fullName")}</label>
          <Input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t("vendorAuth.emailAddress")}</label>
          <Input type="email" value={form.email} onChange={(e) => onChange({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t("users.phoneNumber")}</label>
          <Input value={form.phone} onChange={(e) => onChange({ ...form, phone: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">{t("users.systemRole")}</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={form.role}
            onChange={(e) => onChange({ ...form, role: e.target.value })}
          >
            <option value="USER">{t(ROLE_LABEL_KEY.USER)}</option>
            <option value="ADMIN">{t(ROLE_LABEL_KEY.ADMIN)}</option>
            <option value="DRIVER">{t(ROLE_LABEL_KEY.DRIVER)}</option>
          </select>
        </div>

        <Button type="submit" className="w-full rounded-xl gap-2" disabled={isSaving}>
          <Save className="h-4 w-4" /> {t("users.saveModifications")}
        </Button>
      </form>
    </div>
  );
}
