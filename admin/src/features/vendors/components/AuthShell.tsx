import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FadeIn } from "@/components/motion/FadeIn";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface AuthShellProps {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  /** The header block's bottom margin -- the login view uses mb-10, the forgot-password view mb-8. */
  headerClassName?: string;
}

/**
 * The full-screen auth layout (background decor + centered card + copyright
 * footer) shared between VendorLogin's default sign-in view and its forgot-
 * password view -- these were two ~15-line near-identical copies in the
 * original page, differing only in the icon/title/subtitle, the header
 * block's bottom margin (mb-10 vs mb-8), and the card's own content.
 */
export function AuthShell({ icon, title, subtitle, children, headerClassName = "text-center mb-8" }: AuthShellProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <FadeIn className="w-full max-w-md p-8 relative z-10">
        <div className={headerClassName}>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">{icon}</div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl">{children}</div>

        <p className="text-center text-xs text-muted-foreground mt-8">{t("auth.copyright")}</p>
      </FadeIn>
    </div>
  );
}
