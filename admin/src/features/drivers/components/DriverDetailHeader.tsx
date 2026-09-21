import { ArrowLeft, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DriverDetailHeaderProps {
  isBlocked: boolean;
  isUpdating: boolean;
  onBack: () => void;
  onToggleBlock: () => void;
  onDeleteClick: () => void;
}

/** The back-navigation + block/remove actions row at the top of DriverDetail. */
export function DriverDetailHeader({ isBlocked, isUpdating, onBack, onToggleBlock, onDeleteClick }: DriverDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
        <ArrowLeft className="h-4 w-4" /> Back to Drivers
      </Button>
      <div className="flex gap-2">
        <Button variant={isBlocked ? "outline" : "destructive"} className="rounded-xl gap-2" onClick={onToggleBlock} disabled={isUpdating}>
          {isBlocked ? (
            <>
              <ShieldCheck className="h-4 w-4 text-green-500" /> Reactivate Duty
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4" /> Block Driver Account
            </>
          )}
        </Button>
        <Button variant="destructive" className="rounded-xl gap-2" onClick={onDeleteClick}>
          <Trash2 className="h-4.5 w-4.5" /> Remove Driver
        </Button>
      </div>
    </div>
  );
}
