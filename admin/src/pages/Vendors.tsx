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

  const emptyLabel = vendors?.length === 0 ? "No vendors found. Add your first restaurant!" : "No vendors match your filters.";

  return (
    <DashboardLayout searchPlaceholder="Search vendors...">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">Vendor Management</h1>
            <p className="page-subtitle">Onboard and manage your restaurant partners.</p>
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

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemLabel="vendors" shownCount={paginatedVendors.length} totalCount={filteredVendors.length} />
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
