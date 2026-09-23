import { ArrowLeft, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface UserDetailHeaderProps {
  isBlocked: boolean;
  isTogglingBlock: boolean;
  onBack: () => void;
  onToggleBlock: () => void;
  onDeleteClick: () => void;
}

/** The back-navigation + suspend/delete actions row at the top of UserDetail. */
export function UserDetailHeader({ isBlocked, isTogglingBlock, onBack, onToggleBlock, onDeleteClick }: UserDetailHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
        <ArrowLeft className="h-4 w-4" /> {t("users.backToUsers")}
      </Button>
      <div className="flex gap-2">
        <Button variant={isBlocked ? "outline" : "destructive"} className="rounded-xl gap-2" onClick={onToggleBlock} disabled={isTogglingBlock}>
          {isBlocked ? (
            <>
              <ShieldCheck className="h-4 w-4 text-green-500" /> {t("users.liftSuspension")}
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4" /> {t("users.suspendBanAccount")}
            </>
          )}
        </Button>
        <Button variant="destructive" className="rounded-xl gap-2" onClick={onDeleteClick}>
          <Trash2 className="h-4 w-4" /> {t("users.deleteAccount")}
        </Button>
      </div>
    </div>
  );
}
