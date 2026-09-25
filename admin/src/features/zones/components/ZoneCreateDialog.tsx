import { MapPin, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ZoneForm } from "./ZoneForm";
import { ZoneMapEditor } from "./ZoneMapEditor";
import type { LatLng } from "../types";

interface ZoneCreateDialogProps {
  open: boolean;
  onClose: () => void;
  isLoaded: boolean;
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
  isSubmitting: boolean;
  modalMapCenter: LatLng;
  modalMapZoom: number;
  previewCircleCenter: LatLng | null;
  previewPolygonPath: LatLng[];
  polygonMarkers: LatLng[];
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  onCircleCenterChange: (lat: string, lng: string) => void;
  onPolygonMarkerDragEnd: (index: number, e: google.maps.MapMouseEvent) => void;
}

/**
 * The Create Zone modal shell. Note this is a hand-rolled `fixed inset-0`
 * overlay, not the shadcn Dialog every other page uses -- kept exactly as
 * originally built (no backdrop-click-to-close, no Escape-to-close) since
 * "upgrading" it would be a real interaction change.
 */
export function ZoneCreateDialog({ open, onClose, ...rest }: ZoneCreateDialogProps) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 bg-card">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground text-base">{t("zones.createDynamicPricingZone")}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2">
          <ZoneForm
            name={rest.name}
            onNameChange={rest.onNameChange}
            type={rest.type}
            onTypeChange={rest.onTypeChange}
            multiplier={rest.multiplier}
            onMultiplierChange={rest.onMultiplierChange}
            autoSurge={rest.autoSurge}
            onAutoSurgeChange={rest.onAutoSurgeChange}
            centerLat={rest.centerLat}
            onCenterLatChange={rest.onCenterLatChange}
            centerLng={rest.centerLng}
            onCenterLngChange={rest.onCenterLngChange}
            radius={rest.radius}
            onRadiusChange={rest.onRadiusChange}
            polyCoords={rest.polyCoords}
            onPolyCoordsChange={rest.onPolyCoordsChange}
            onUndoCoordinate={rest.onUndoCoordinate}
            onClearCoordinates={rest.onClearCoordinates}
            showAdvanced={rest.showAdvanced}
            onToggleAdvanced={rest.onToggleAdvanced}
            description={rest.description}
            onDescriptionChange={rest.onDescriptionChange}
            selectedServices={rest.selectedServices}
            onToggleService={rest.onToggleService}
            startTime={rest.startTime}
            onStartTimeChange={rest.onStartTimeChange}
            endTime={rest.endTime}
            onEndTimeChange={rest.onEndTimeChange}
            isActive={rest.isActive}
            onIsActiveChange={rest.onIsActiveChange}
            onSubmit={rest.onSubmit}
            onCancel={onClose}
            isSubmitting={rest.isSubmitting}
          />

          <ZoneMapEditor
            isLoaded={rest.isLoaded}
            type={rest.type}
            modalMapCenter={rest.modalMapCenter}
            modalMapZoom={rest.modalMapZoom}
            previewCircleCenter={rest.previewCircleCenter}
            previewPolygonPath={rest.previewPolygonPath}
            radius={rest.radius}
            polygonMarkers={rest.polygonMarkers}
            onMapClick={rest.onMapClick}
            onCircleCenterChange={rest.onCircleCenterChange}
            onPolygonMarkerDragEnd={rest.onPolygonMarkerDragEnd}
          />
        </div>
      </div>
    </div>
  );
}
