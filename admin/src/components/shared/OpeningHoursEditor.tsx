import { Input } from "@/components/ui/input";
import { WEEK_DAYS } from "./hoursUtils";
import type { DayKey, HoursDraft } from "./hoursUtils";

/**
 * Promoted here from features/vendors/ once features/catalog/ (MeatCenters)
 * needed the exact same component.
 */
export function OpeningHoursEditor({ draft, onChange }: { draft: HoursDraft; onChange: (next: HoursDraft) => void }) {
  const setDay = (key: DayKey, patch: Partial<HoursDraft[DayKey]>) => onChange({ ...draft, [key]: { ...draft[key], ...patch } });

  return (
    <div className="space-y-2">
      {WEEK_DAYS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <span className="w-[70px] shrink-0 text-xs font-semibold text-muted-foreground">{label}</span>
          {draft[key].closed ? (
            <span className="flex-1 text-xs text-muted-foreground italic">Closed all day</span>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <Input type="time" value={draft[key].open} onChange={(e) => setDay(key, { open: e.target.value })} className="h-9 w-[110px] text-xs" />
              <span className="text-xs text-muted-foreground">to</span>
              <Input type="time" value={draft[key].close} onChange={(e) => setDay(key, { close: e.target.value })} className="h-9 w-[110px] text-xs" />
            </div>
          )}
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={draft[key].closed}
              onChange={(e) => setDay(key, { closed: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            Closed
          </label>
        </div>
      ))}
    </div>
  );
}
