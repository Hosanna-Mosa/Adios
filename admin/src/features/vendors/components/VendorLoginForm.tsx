import { Mail, Phone, Lock, ArrowRight, Loader2, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PanelRole } from "@/lib/session";
import { ROLE_ICONS } from "../roleIcons";

interface VendorLoginFormProps {
  role: PanelRole;
  onRoleChange: (role: PanelRole) => void;
  identifier: string;
  onIdentifierChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onForgotPasswordClick: () => void;
}

/** The default sign-in form on VendorLogin. */
export function VendorLoginForm({
  role,
  onRoleChange,
  identifier,
  onIdentifierChange,
  password,
  onPasswordChange,
  onSubmit,
  isLoading,
  onForgotPasswordClick,
}: VendorLoginFormProps) {
  const { t } = useTranslation();
  const isVendor = role === "vendor";

  const roleOptions: { value: PanelRole; label: string }[] = [
    { value: "vendor", label: t("panelAuth.roleVendor", "Vendor partner") },
    { value: "admin", label: t("panelAuth.roleAdmin", "Admin") },
    { value: "support", label: t("panelAuth.roleSupport", "Support team") },
  ];

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="login-role" className="text-sm font-medium text-foreground">
            {t("panelAuth.signInAs", "Sign in as")}
          </label>
          <Select value={role} onValueChange={(value) => onRoleChange(value as PanelRole)}>
            <SelectTrigger id="login-role" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(({ value, label }) => {
                const Icon = ROLE_ICONS[value];
                return (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {role === "support" && (
          <div className="flex gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <p>{t("panelAuth.supportHint", "Use the email and password your admin created for you. You'll see customer and driver support cases only.")}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="login-identifier" className="text-sm font-medium text-foreground">
            {role === "support" ? t("panelAuth.workEmail", "Work email") : t("vendorAuth.emailOrPhone")}
          </label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground">
              {role === "support" || identifier.includes("@") ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            </div>
            <Input
              id="login-identifier"
              type={role === "support" ? "email" : "text"}
              autoComplete="username"
              placeholder={role === "support" ? "name@company.com" : t("vendorAuth.enterEmailOrMobile")}
              className="pl-10 h-11"
              value={identifier}
              onChange={(e) => onIdentifierChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-foreground">
              {t("vendorAuth.password")}
            </label>
            {isVendor && (
              <button type="button" className="text-xs text-primary hover:underline" onClick={onForgotPasswordClick}>
                {t("vendorAuth.forgotPassword")}
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-10 h-11"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
          </div>
          {role === "support" && (
            <p className="text-xs text-muted-foreground">{t("panelAuth.supportForgotPassword", "Forgot your password? Ask your admin to reset it.")}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-11 text-base font-semibold group" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <>
              {t("vendorAuth.signIn")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </form>

    </>
  );
}
