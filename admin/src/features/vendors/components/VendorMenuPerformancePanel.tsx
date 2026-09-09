import { ChevronRight, Utensils } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

interface VendorMenuPerformancePanelProps {
  isMeatVendor: boolean;
}

/**
 * The "Menu Performance" panel (right column) on VendorDashboard. Kept
 * exactly as originally built: it always renders this same empty-state
 * placeholder regardless of the fetched menu data or its length (that
 * data currently only feeds the "Active Menu Items" stat card, not this
 * panel) -- preserved as a move, not "fixed" into a real menu-performance
 * view, since that would be new functionality this refactor isn't meant
 * to add.
 */
export function VendorMenuPerformancePanel({ isMeatVendor }: VendorMenuPerformancePanelProps) {
  return (
    <FadeIn delay={0.05} className="bg-card border border-border rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Menu Performance</h2>
        <button className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
          Manage Menu <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Utensils className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">{isMeatVendor ? "Your meat inventory is empty" : "Your menu is empty"}</h3>
        <p className="text-sm text-muted-foreground max-w-[250px] mt-2">{isMeatVendor ? "Add your first meat items to start receiving orders." : "Add your first food items to start receiving orders."}</p>
      </div>
    </FadeIn>
  );
}
