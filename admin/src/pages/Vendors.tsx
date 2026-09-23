import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Pagination } from "@/components/shared/Pagination";
import { useVendorsList } from "@/features/vendors/hooks/useVendorsList";
import { useVendorAddForm } from "@/features/vendors/hooks/useVendorAddForm";
import { useVendorEditForm } from "@/features/vendors/hooks/useVendorEditForm";
import { VendorFilters } from "@/features/vendors/components/VendorFilters";
import { VendorTable } from "@/features/vendors/components/VendorTable";
import { VendorAddDialog } from "@/features/vendors/components/VendorAddDialog";
import { VendorEditDialog } from "@/features/vendors/components/VendorEditDialog";
import { VendorViewDialog } from "@/features/vendors/components/VendorViewDialog";

export default function Vendors() {
  const { t } = useTranslation();
  const {
    vendors,
    isLoading,
    filterSearch,
    setFilterSearch,
    filterStatus,
    setFilterStatus,
    filterVeg,
    setFilterVeg,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredVendors,
    paginatedVendors,
    handleDeleteClick,
    updateVendorMutation,
    isViewOpen,
    setIsViewOpen,
    viewingVendor,
    commRate,
    setCommRate,
    handleViewClick,
    handleToggleManuallyClosed,
    handleSaveCommission,
    handleApprove,
    handleReject,
  } = useVendorsList();

  const {
    isAddOpen,
    setIsAddOpen,
    newVendor,
    setNewVendor,
    searchQuery,
    selectedPlace,
    suggestions,
    isSearching,
    handleSearch,
    handleSelectSuggestion,
    handleSubmit,
    isSubmitting,
  } = useVendorAddForm();

  const {
    isEditOpen,
    setIsEditOpen,
    editForm,
    setEditForm,
    editHoursEnabled,
    setEditHoursEnabled,
    editHours,
    setEditHours,
    handleEditClick,
    handleEditSubmit,
    isSaving,
  } = useVendorEditForm(updateVendorMutation);

  const emptyLabel = vendors?.length === 0 ? t("catalog.noVendorsFoundAddFirstDesc") : t("catalog.noVendorsMatchFiltersDesc");

  return (
    <DashboardLayout searchPlaceholder={t("catalog.searchVendors")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{t("catalog.vendorManagement")}</h1>
            <p className="page-subtitle">{t("catalog.onboardManageRestaurantPartnersDesc")}</p>
          </div>

          <VendorAddDialog
            isOpen={isAddOpen}
            onOpenChange={setIsAddOpen}
            newVendor={newVendor}
            onChange={setNewVendor}
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

        <VendorFilters filterSearch={filterSearch} onSearchChange={setFilterSearch} filterStatus={filterStatus} onStatusChange={setFilterStatus} filterVeg={filterVeg} onVegChange={setFilterVeg} />

        <div className="section-card overflow-hidden">
          <VendorTable
            vendors={paginatedVendors}
            isLoading={isLoading}
            emptyLabel={emptyLabel}
            onViewClick={handleViewClick}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemLabel={t("catalog.vendorsLower")} shownCount={paginatedVendors.length} totalCount={filteredVendors.length} />
        </div>
      </div>

      <VendorViewDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        vendor={viewingVendor}
        commRate={commRate}
        onCommRateChange={setCommRate}
        isUpdating={updateVendorMutation.isPending}
        onToggleManuallyClosed={handleToggleManuallyClosed}
        onSaveCommission={handleSaveCommission}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <VendorEditDialog
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
