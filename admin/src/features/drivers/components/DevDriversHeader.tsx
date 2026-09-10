import { Button } from "@/components/ui/button";
import { RefreshCw, Play, ShieldAlert } from "lucide-react";

interface DevDriversHeaderProps {
  isSeeding: boolean;
  isDeleting: boolean;
  onSeed: () => void;
  onDelete: () => void;
}

/** The title + seed/delete action buttons on DevDrivers.tsx. */
export function DevDriversHeader({ isSeeding, isDeleting, onSeed, onDelete }: DevDriversHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold text-foreground">Dev Drivers Control Center</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Seed, reset, and position check drivers in Yanam/Kakinada to test user booking map updates.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          onClick={onDelete}
          disabled={isDeleting}
          variant="destructive"
          className="flex items-center gap-2"
        >
          {isDeleting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldAlert className="h-4 w-4" />
          )}
          Delete Dev Drivers
        </Button>
        <Button
          onClick={onSeed}
          disabled={isSeeding}
          className="flex items-center gap-2"
        >
          {isSeeding ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Seed/Reset 10 Dev Drivers
        </Button>
      </div>
    </div>
  );
}
