import { Loader2, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRestaurantMenuList } from "@/features/catalog/hooks/useRestaurantMenuList";
import { useRestaurantAddFlow } from "@/features/catalog/hooks/useRestaurantAddFlow";
import { useRestaurantEditFlow } from "@/features/catalog/hooks/useRestaurantEditFlow";
import { RestaurantSearchBox } from "@/features/catalog/components/RestaurantSearchBox";
import { RestaurantTable } from "@/features/catalog/components/RestaurantTable";
import { RestaurantPaginationBar } from "@/features/catalog/components/RestaurantPaginationBar";
import { RestaurantAddDialog } from "@/features/catalog/components/RestaurantAddDialog";
import { RestaurantEditDialog } from "@/features/catalog/components/RestaurantEditDialog";
import { RestaurantViewDialog } from "@/features/catalog/components/RestaurantViewDialog";
import { RestaurantQrDialog } from "@/features/catalog/components/RestaurantQrDialog";

export default function RestaurantMenu() {
  const { t } = useTranslation();
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredRestaurants,
    totalPages,
    paginatedRestaurants,
    fetchMenu,
    handleDelete,
    isViewOpen,
    setIsViewOpen,
    isQrOpen,
    setIsQrOpen,
    selectedRestaurant,
    selectedQrRestaurant,
    viewMenu,
    isLoadingMenu: isLoadingViewMenu,
    handleViewClick,
    handleQrClick,
    handleDownloadQr,
  } = useRestaurantMenuList();

  const {
    isAddOpen,
    setIsAddOpen,
    step,
    setStep,
    restaurantForm,
    setRestaurantForm,
    menuImages,
    setMenuImages,
    isExtracting,
    extractedMenu,
    setExtractedMenu,
    handleAddRestaurantNext,
    handleImageChange,
    handleExtractMenu,
    handleItemImageUpload: handleAddItemImageUpload,
    handleSaveRestaurant,
    isSaving: isCreating,
  } = useRestaurantAddFlow();

  const {
    isEditOpen,
    setIsEditOpen,
    editForm,
    setEditForm,
    editMenu,
    setEditMenu,
    isLoadingMenu: isLoadingEditMenu,
    handleEditClick,
    handleEditSubmit,
    handleItemImageUpload: handleEditItemImageUpload,
    isSaving: isEditing,
  } = useRestaurantEditFlow({ fetchMenu });

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#00665c] tracking-tight">{t("catalog.restaurantMenuManager")}</h1>
            <p className="text-muted-foreground text-sm">{t("catalog.restaurantMenuManagerDesc")}</p>
          </div>
          <RestaurantAddDialog
            isOpen={isAddOpen}
            onOpenChange={setIsAddOpen}
            step={step}
            setStep={setStep}
            restaurantForm={restaurantForm}
            setRestaurantForm={setRestaurantForm}
            onNext={handleAddRestaurantNext}
            menuImages={menuImages}
            onImageChange={handleImageChange}
            onRemoveImage={(idx) => setMenuImages(menuImages.filter((_, i) => i !== idx))}
            onExtract={handleExtractMenu}
            isExtracting={isExtracting}
            extractedMenu={extractedMenu}
            setExtractedMenu={setExtractedMenu}
            onUploadImage={handleAddItemImageUpload}
            onSave={handleSaveRestaurant}
            isSaving={isCreating}
          />
        </div>

        <RestaurantSearchBox value={searchQuery} onChange={setSearchQuery} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-[#00665c] animate-spin" />
            <p className="text-muted-foreground text-sm font-semibold">{t("catalog.loadingRestaurants")}</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-3xl space-y-3 bg-white">
            <Store className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-lg font-bold text-foreground">{t("catalog.noRestaurantsFound")}</p>
            <p className="text-muted-foreground text-sm">{t("catalog.addFirstRestaurantToGetStarted")}</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <RestaurantTable
              restaurants={paginatedRestaurants}
              onViewClick={handleViewClick}
              onQrClick={handleQrClick}
              onEditClick={handleEditClick}
              onDelete={handleDelete}
            />
            <RestaurantPaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              shownFrom={Math.min((currentPage - 1) * itemsPerPage + 1, filteredRestaurants.length)}
              shownTo={Math.min(currentPage * itemsPerPage, filteredRestaurants.length)}
              totalCount={filteredRestaurants.length}
            />
          </div>
        )}

        <RestaurantViewDialog isOpen={isViewOpen} onOpenChange={setIsViewOpen} restaurant={selectedRestaurant} menu={viewMenu} isLoading={isLoadingViewMenu} />

        <RestaurantEditDialog
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          editForm={editForm}
          setEditForm={setEditForm}
          editMenu={editMenu}
          setEditMenu={setEditMenu}
          isLoadingMenu={isLoadingEditMenu}
          onUploadImage={handleEditItemImageUpload}
          onSubmit={handleEditSubmit}
          isSaving={isEditing}
        />

        <RestaurantQrDialog isOpen={isQrOpen} onOpenChange={setIsQrOpen} restaurant={selectedQrRestaurant} onDownload={handleDownloadQr} />
      </div>
    </DashboardLayout>
  );
}
