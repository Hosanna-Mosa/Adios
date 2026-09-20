import { FadeIn } from "@/components/motion/FadeIn";

const WEEKS = ["W1", "W2", "W3", "W4"];

interface RevenueStreamPanelProps {
  selectedWeek: string;
  onSelectWeek: (week: string) => void;
}

/** The "Revenue Stream" panel: a week selector and a static growth figure -- no actual chart here. */
export function RevenueStreamPanel({ selectedWeek, onSelectWeek }: RevenueStreamPanelProps) {
  return (
    <FadeIn delay={0.05} className="section-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Revenue Stream</h3>
      <div className="flex items-center justify-center gap-4 mb-6">
        {WEEKS.map((w) => (
          <button
            key={w}
            onClick={() => onSelectWeek(w)}
            className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-all ${w === selectedWeek ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"}`}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">Monthly Growth</span>
        <span className="text-sm font-semibold text-success">+12.4%</span>
      </div>
    </FadeIn>
  );
}
