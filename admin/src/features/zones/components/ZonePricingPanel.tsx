interface ZonePricingPanelProps {
  multiplier: string;
  onMultiplierChange: (value: string) => void;
}

/**
 * The "Price Multiplier (Surge)" field from the Create Zone form. Scoped to
 * just the multiplier input, not also the auto-surge checkbox below it --
 * the two sit in different DOM containers in the original markup (this one
 * inside a 2-column grid alongside the unrelated Geofence Type select, the
 * checkbox as a separate sibling block after the grid), so folding both
 * into one component would require restructuring that grid, which is a
 * DOM/UI change this refactor isn't meant to make. The auto-surge checkbox
 * stays inline in ZoneForm.
 */
export function ZonePricingPanel({ multiplier, onMultiplierChange }: ZonePricingPanelProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Price Multiplier (Surge)</label>
      <input
        type="number"
        step="0.1"
        min="1.0"
        max="10.0"
        value={multiplier}
        onChange={(e) => onMultiplierChange(e.target.value)}
        placeholder="e.g. 1.5"
        className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        required
      />
    </div>
  );
}
