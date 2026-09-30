import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getSessionData, getStaffRole } from "@/lib/session";
import { NotificationBell } from "./NotificationBell";
import { LazyImage } from "@/components/shared/LazyImage";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

interface TopBarProps {
  searchPlaceholder?: string;
  onToggleSidebar?: () => void;
  profileName?: string;
  profileRole?: string;
  avatarUrl?: string;
}

export function TopBar({
  onToggleSidebar,
  profileName,
  profileRole,
  avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
}: TopBarProps) {
  const { t } = useTranslation();
  const staffRole = getStaffRole();
  const sessionName = staffRole ? getSessionData<{ name?: string }>(staffRole)?.name : undefined;
  const name = profileName ?? sessionName ?? "Admin";
  const roleLabel =
    profileRole ?? (staffRole === "support" ? t("panelAuth.supportAgent", "Support Agent") : t("panelAuth.superAdmin", "Super Admin"));

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <LanguageSwitcher />
        <NotificationBell />

        {/* Profile */}
        <div className="flex items-center gap-3">
          {staffRole === "support" ? (
            <div className="h-9 w-9 rounded-full bg-brand-teal-soft text-brand-teal flex items-center justify-center text-sm font-bold border border-border shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <LazyImage
              src={avatarUrl}
              alt={name}
              className="h-9 w-9 rounded-full object-cover border border-border shadow-sm"
              wrapperClassName="h-9 w-9 rounded-full shrink-0"
            />
          )}
          <div className="text-left">
            <p className="text-xs font-extrabold text-foreground leading-none">{name}</p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1 leading-none">{roleLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
