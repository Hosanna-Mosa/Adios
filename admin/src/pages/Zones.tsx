import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useZonesList } from "@/features/zones/hooks/useZonesList";
import { useZoneForm } from "@/features/zones/hooks/useZoneForm";
import { ZoneList } from "@/features/zones/components/ZoneList";
import { ZoneMapPreview } from "@/features/zones/components/ZoneMapPreview";
import { ZoneCreateDialog } from "@/features/zones/components/ZoneCreateDialog";
import { ZoneEditDialog } from "@/features/zones/components/ZoneEditDialog";

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
    editingZone,
    editForm,
    setEditForm,
    openEditZone,
    closeEditZone,
    handleEditSubmit,
    isSavingEdit,
    getGoogleCoords,
    getGoogleCenter,
    getZoneColors,
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
        {/* Main Grid: Zones List (Col 2/3) and Map Preview (Col 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ZoneList
            zones={zones}
            isLoading={isLoading}
            selectedZone={selectedZone}
            onSelectZone={handleSelectZone}
            onToggleActive={handleToggleActive}
            onToggleAutoSurge={handleToggleAutoSurge}
            onEdit={openEditZone}
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
            onEditZone={openEditZone}
          />
        </div>
      </div>

      <ZoneEditDialog zone={editingZone} form={editForm} onChange={setEditForm} onClose={closeEditZone} onSubmit={handleEditSubmit} isSaving={isSavingEdit} />

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
