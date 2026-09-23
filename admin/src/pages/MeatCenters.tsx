import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMeatCentersList } from "@/features/catalog/hooks/useMeatCentersList";
import { useMeatCenterAddForm } from "@/features/catalog/hooks/useMeatCenterAddForm";
import { useMeatCenterEditForm } from "@/features/catalog/hooks/useMeatCenterEditForm";
import { MeatCenterTable } from "@/features/catalog/components/MeatCenterTable";
import { MeatCenterAddDialog } from "@/features/catalog/components/MeatCenterAddDialog";
import { MeatCenterEditDialog } from "@/features/catalog/components/MeatCenterEditDialog";
import { MeatCenterViewDialog } from "@/features/catalog/components/MeatCenterViewDialog";

export default function MeatCenters() {
  const { t } = useTranslation();
  const { centers, isLoading, handleDeleteClick, updateCenterMutation, isViewOpen, setIsViewOpen, viewingCenter, handleViewClick, handleToggleManuallyClosed } = useMeatCentersList();

  const { isAddOpen, setIsAddOpen, newCenter, setNewCenter, searchQuery, suggestions, isSearching, selectedPlace, handleSearch, handleSelectSuggestion, handleSubmit, isSubmitting } =
    useMeatCenterAddForm();

  const { isEditOpen, setIsEditOpen, editForm, setEditForm, editHoursEnabled, setEditHoursEnabled, editHours, setEditHours, handleEditClick, handleEditSubmit, isSaving } =
    useMeatCenterEditForm(updateCenterMutation);

  return (
    <DashboardLayout searchPlaceholder={t("catalog.searchMeatCenters")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header text-3xl font-bold">{t("catalog.meatCenterManagement")}</h1>
            <p className="page-subtitle text-muted-foreground">{t("catalog.manageMeatDeliveryPartnersDesc")}</p>
          </div>

          <MeatCenterAddDialog
            isOpen={isAddOpen}
            onOpenChange={setIsAddOpen}
            newCenter={newCenter}
            onChange={setNewCenter}
            searchQuery={searchQuery}
            suggestions={suggestions}
            isSearching={isSearching}
            selectedPlace={selectedPlace}
            onSearch={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <MeatCenterTable centers={centers || []} isLoading={isLoading} onViewClick={handleViewClick} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
      </div>

      <MeatCenterViewDialog isOpen={isViewOpen} onOpenChange={setIsViewOpen} center={viewingCenter} isUpdating={updateCenterMutation.isPending} onToggleManuallyClosed={handleToggleManuallyClosed} />

      <MeatCenterEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        editForm={editForm}
        onChange={setEditForm}
        editHoursEnabled={editHoursEnabled}
        onHoursEnabledChange={setEditHoursEnabled}
        editHours={editHours}
        onHoursChange={setEditHours}
        onSubmit={handleEditSubmit}
        isSaving={isSaving}
      />
    </DashboardLayout>
  );
}
