import { Mail, Phone, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VendorLoginFormProps {
  identifier: string;
  onIdentifierChange: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onForgotPasswordClick: () => void;
}

/** The default sign-in form on VendorLogin. */
export function VendorLoginForm({ identifier, onIdentifierChange, password, onPasswordChange, onSubmit, isLoading, onForgotPasswordClick }: VendorLoginFormProps) {
  const { t } = useTranslation();
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("vendorAuth.emailOrPhone")}</label>
          <div className="relative">
            <div className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground">{identifier.includes("@") ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}</div>
            <Input placeholder={t("vendorAuth.enterEmailOrMobile")} className="pl-10 h-11" value={identifier} onChange={(e) => onIdentifierChange(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">{t("vendorAuth.password")}</label>
            <button type="button" className="text-xs text-primary hover:underline" onClick={onForgotPasswordClick}>
              {t("vendorAuth.forgotPassword")}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="password" placeholder="••••••••" className="pl-10 h-11" value={password} onChange={(e) => onPasswordChange(e.target.value)} />
          </div>
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

      <div className="mt-8 pt-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          {t("vendorAuth.notAPartnerYet")} <button className="text-primary font-semibold hover:underline">{t("vendorAuth.joinPrecisionNav")}</button>
        </p>
      </div>
    </>
  );
}
