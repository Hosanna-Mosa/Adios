import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  label: string;
}

/** Re-reads a polled page's data now instead of waiting for the next poll. */
export function RefreshButton({ onRefresh, isRefreshing, label }: RefreshButtonProps) {
  return (
    <Button
      onClick={onRefresh}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {label}
    </Button>
  );
}
