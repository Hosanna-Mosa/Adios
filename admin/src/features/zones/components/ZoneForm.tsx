import { Compass, SlidersHorizontal, Undo, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { AVAILABLE_SERVICES } from "../constants";
import { ZonePricingPanel } from "./ZonePricingPanel";

interface ZoneFormProps {
  name: string;
  onNameChange: (value: string) => void;
  type: "polygon" | "circle";
  onTypeChange: (value: "polygon" | "circle") => void;
  multiplier: string;
  onMultiplierChange: (value: string) => void;
  autoSurge: boolean;
  onAutoSurgeChange: (value: boolean) => void;
  centerLat: string;
  onCenterLatChange: (value: string) => void;
  centerLng: string;
  onCenterLngChange: (value: string) => void;
  radius: string;
  onRadiusChange: (value: string) => void;
  polyCoords: string;
  onPolyCoordsChange: (value: string) => void;
  onUndoCoordinate: () => void;
  onClearCoordinates: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
  startTime: string;
  onStartTimeChange: (value: string) => void;
  endTime: string;
  onEndTimeChange: (value: string) => void;
  isActive: boolean;
  onIsActiveChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

/** The Create Zone dialog's left column: name, type, pricing, coordinates, and advanced options. */
export function ZoneForm({
  name,
  onNameChange,
  type,
  onTypeChange,
  multiplier,
  onMultiplierChange,
  autoSurge,
  onAutoSurgeChange,
  centerLat,
  onCenterLatChange,
  centerLng,
  onCenterLngChange,
  radius,
  onRadiusChange,
  polyCoords,
  onPolyCoordsChange,
  onUndoCoordinate,
  onClearCoordinates,
  showAdvanced,
  onToggleAdvanced,
  description,
  onDescriptionChange,
  selectedServices,
  onToggleService,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  isActive,
  onIsActiveChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: ZoneFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4 border-r border-border overflow-y-auto max-h-[75vh]">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Zone Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Airport High Demand Area"
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Geofence Type</label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as "polygon" | "circle")}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="polygon">Polygon (Custom shape)</option>
            <option value="circle">Circular Radius</option>
          </select>
        </div>
        <ZonePricingPanel multiplier={multiplier} onMultiplierChange={onMultiplierChange} />
      </div>

      <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-lg border border-border">
        <input
          type="checkbox"
          id="autoSurge"
          checked={autoSurge}
          onChange={(e) => onAutoSurgeChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
        <label htmlFor="autoSurge" className="text-xs font-semibold text-foreground cursor-pointer select-none">
          Enable Automatic Pricing Surge (Dynamic Supply vs. Demand scaling)
        </label>
      </div>

      {type === "circle" ? (
        <div className="bg-muted/30 p-4 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-primary" /> Circle Center (Click map or enter below)
            </p>
            <button type="button" onClick={onClearCoordinates} className="text-[10px] text-destructive hover:underline font-semibold">
              Clear coords
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={centerLat}
                onChange={(e) => onCenterLatChange(e.target.value)}
                placeholder="e.g. 12.9200"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={centerLng}
                onChange={(e) => onCenterLngChange(e.target.value)}
                placeholder="e.g. 77.6400"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Radius (in Meters)</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => onRadiusChange(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
        </div>
      ) : (
        <div className="bg-muted/30 p-4 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Polygon coordinates (Click map to draw)
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={onUndoCoordinate} className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5" title="Remove Last Point">
                <Undo className="h-3 w-3" /> Undo Point
              </button>
              <button type="button" onClick={onClearCoordinates} className="text-[10px] text-destructive hover:underline font-semibold">
                Clear all
              </button>
            </div>
          </div>
          <div>
            <textarea
              rows={3}
              value={polyCoords}
              onChange={(e) => onPolyCoordsChange(e.target.value)}
              placeholder="[[lng, lat], [lng, lat], ...]"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <div className="flex items-start gap-1.5 mt-2 bg-yellow-500/10 border border-yellow-500/20 p-2.5 rounded-lg">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-normal">
                Coordinate format expects an array of <strong>[longitude, latitude]</strong> points. You can click points directly on the preview map to
                construct the shape, or drag existing nodes to refine them!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={onToggleAdvanced}
          className="w-full px-4 py-3 bg-muted/40 hover:bg-muted/70 flex items-center justify-between transition-colors border-b border-border"
        >
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" /> Advanced Configurations
          </span>
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAdvanced && (
          <div className="p-4 space-y-4 bg-background">
            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Zone Notes / Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="e.g. Surge applied during peak hours or heavy traffic seasons"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Restricted Service Types (None = All Allowed)</label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_SERVICES.map((s) => {
                  const isSelected = selectedServices.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onToggleService(s.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isSelected ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Active Time Slot Restrictions</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-muted-foreground mb-1 uppercase">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-muted-foreground mb-1 uppercase">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => onEndTimeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-xs focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1.5">If configured, dynamic pricing will only be applied to orders placed within this time interval.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 py-1">
        <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => onIsActiveChange(e.target.checked)} className="h-4 w-4 border-input rounded text-primary focus:ring-primary" />
        <label htmlFor="isActive" className="text-sm font-semibold text-foreground">
          Activate immediately
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-border text-foreground hover:bg-muted text-sm font-semibold rounded-lg">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 rounded-lg flex items-center gap-1">
          {isSubmitting ? "Creating..." : "Save Zone"}
        </button>
      </div>
    </form>
  );
}
