import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Map as MapIcon, MapPin, Compass } from "lucide-react";
import { useZonesList } from "@/features/zones/hooks/useZonesList";
import { useZoneForm } from "@/features/zones/hooks/useZoneForm";
import { ZoneList } from "@/features/zones/components/ZoneList";
import { ZoneMapPreview } from "@/features/zones/components/ZoneMapPreview";
import { ZoneCreateDialog } from "@/features/zones/components/ZoneCreateDialog";

export default function Zones() {
  const { t } = useTranslation();
  const {
    isLoaded,
    zones,
    isLoading,
    selectedZone,
    mapCenter,
    mapZoom,
    mapRef,
    handleSelectZone,
    handleDelete,
    handleToggleActive,
    handleToggleAutoSurge,
    handleRename,
    getGoogleCoords,
    getGoogleCenter,
    getZoneColors,
    activeZonesCount,
    maxMultiplier,
  } = useZonesList();

  const {
    isAddOpen,
    setIsAddOpen,
    openCreateDialog,
    name,
    setName,
    type,
    handleTypeChange,
    multiplier,
    setMultiplier,
    isActive,
    setIsActive,
    centerLat,
    setCenterLat,
    centerLng,
    setCenterLng,
    radius,
    setRadius,
    autoSurge,
    setAutoSurge,
    polyCoords,
    setPolyCoords,
    showAdvanced,
    setShowAdvanced,
    description,
    setDescription,
    selectedServices,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    modalMapCenter,
    modalMapZoom,
    previewCircleCenter,
    previewPolygonPath,
    handleCreateZone,
    isCreating,
    handleModalMapClick,
    handleMarkerDragEnd,
    handleUndoCoordinate,
    clearModalCoordinates,
    toggleServiceSelection,
    getPolygonMarkers,
  } = useZoneForm({ onCreated: handleSelectZone });

  return (
    <DashboardLayout searchPlaceholder={t("zones.searchZones")}>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <StaggerList className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StaggerItem>
            <StatCard icon={<MapIcon className="h-5 w-5 text-indigo-500" />} label={t("zones.totalZones")} value={zones.length.toString()} badge={t("zones.configured")} badgeColor="success" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<Compass className="h-5 w-5 text-emerald-500" />} label={t("zones.activeZones")} value={activeZonesCount.toString()} badge={t("zones.liveGeofences")} badgeColor="success" />
          </StaggerItem>
          <StaggerItem>
            <StatCard icon={<MapPin className="h-5 w-5 text-amber-500" />} label={t("zones.surgeMultipliers")} value={t("zones.xMax", { value: maxMultiplier, defaultValue: "{{value}}x Max" })} badge={t("zones.dynamicPricing")} badgeColor="warning" />
          </StaggerItem>
          <StaggerItem className="stat-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 flex flex-col justify-between p-5 rounded-xl border">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">{t("zones.dynamicControl")}</p>
              <h4 className="text-2xl font-bold text-foreground mt-1.5">{t("zones.mapEngine")}</h4>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("zones.visualizingOperationalBoundariesDesc")}</p>
          </StaggerItem>
        </StaggerList>

        {/* Main Grid: Zones List (Col 2/3) and Map Preview (Col 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ZoneList
            zones={zones}
            isLoading={isLoading}
            selectedZone={selectedZone}
            onSelectZone={handleSelectZone}
            onToggleActive={handleToggleActive}
            onToggleAutoSurge={handleToggleAutoSurge}
            onRename={handleRename}
            onDelete={handleDelete}
            onCreateClick={openCreateDialog}
          />

          <ZoneMapPreview
            isLoaded={isLoaded}
            selectedZone={selectedZone}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            mapRef={mapRef}
            getGoogleCoords={getGoogleCoords}
            getGoogleCenter={getGoogleCenter}
            getZoneColors={getZoneColors}
          />
        </div>
      </div>

      <ZoneCreateDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        isLoaded={isLoaded}
        name={name}
        onNameChange={setName}
        type={type}
        onTypeChange={handleTypeChange}
        multiplier={multiplier}
        onMultiplierChange={setMultiplier}
        autoSurge={autoSurge}
        onAutoSurgeChange={setAutoSurge}
        centerLat={centerLat}
        onCenterLatChange={setCenterLat}
        centerLng={centerLng}
        onCenterLngChange={setCenterLng}
        radius={radius}
        onRadiusChange={setRadius}
        polyCoords={polyCoords}
        onPolyCoordsChange={setPolyCoords}
        onUndoCoordinate={handleUndoCoordinate}
        onClearCoordinates={clearModalCoordinates}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        description={description}
        onDescriptionChange={setDescription}
        selectedServices={selectedServices}
        onToggleService={toggleServiceSelection}
        startTime={startTime}
        onStartTimeChange={setStartTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        isActive={isActive}
        onIsActiveChange={setIsActive}
        onSubmit={handleCreateZone}
        isSubmitting={isCreating}
        modalMapCenter={modalMapCenter}
        modalMapZoom={modalMapZoom}
        previewCircleCenter={previewCircleCenter}
        previewPolygonPath={previewPolygonPath}
        polygonMarkers={getPolygonMarkers()}
        onMapClick={handleModalMapClick}
        onCircleCenterChange={(lat, lng) => {
          setCenterLat(lat);
          setCenterLng(lng);
        }}
        onPolygonMarkerDragEnd={handleMarkerDragEnd}
      />
    </DashboardLayout>
  );
}
