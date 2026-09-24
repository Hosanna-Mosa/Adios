import { User, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DetailIdentityCard } from "@/components/shared/DetailIdentityCard";
import type { UserProfile } from "../userDetailTypes";

interface UserIdentityCardProps {
  user: UserProfile;
}

/** The user identity/status header card: avatar, name, status badge, registration date. */
export function UserIdentityCard({ user }: UserIdentityCardProps) {
  const { t } = useTranslation();
  return (
    <DetailIdentityCard
      icon={<User className="h-8 w-8" />}
      title={user.name}
      badges={
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            user.isBlocked ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
          }`}
        >
          {user.isBlocked ? t("users.suspended") : t("users.active")}
        </span>
      }
      subtitle={t("users.uidColon", { id: user._id, defaultValue: "UID: {{id}}" })}
      rightContent={
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2.5 rounded-2xl">
          <Calendar className="h-4 w-4" />
          <span>{t("users.registeredOnColon", { date: new Date(user.createdAt).toLocaleDateString(), defaultValue: "Registered On: {{date}}" })}</span>
        </div>
      }
    />
  );
}
