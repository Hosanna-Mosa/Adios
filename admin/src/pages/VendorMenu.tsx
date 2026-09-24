import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { VendorLayout } from "@/components/layout/VendorLayout";
import { useVendorMenu } from "@/features/vendors/hooks/useVendorMenu";
import { VendorAddDishDialog } from "@/features/vendors/components/VendorAddDishDialog";
import { VendorEditDishDialog } from "@/features/vendors/components/VendorEditDishDialog";
import { VendorMenuGrid } from "@/features/vendors/components/VendorMenuGrid";

export default function VendorMenu() {
  const { t } = useTranslation();
  const {
    vendorData,
    menu,
    isLoading,
    isAddOpen,
    setIsAddOpen,
    isEditOpen,
    setIsEditOpen,
    newItem,
    setNewItem,
    editItemForm,
    setEditItemForm,
    uploading,
    dropzone,
    removeImage,
    handleEditClick,
    handleEditSubmit,
    handleSubmit,
    isAdding,
    isUpdating,
    deleteFood,
    toggleAvailability,
    isTogglingId,
  } = useVendorMenu();

  const { getRootProps, getInputProps, isDragActive } = dropzone;

  if (vendorData.role === "meat_vendor") {
    return <Navigate to="/vendor/meat-menu" replace />;
  }

  return (
    <VendorLayout searchPlaceholder={t("vendorMenu.searchMenuItems")}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("vendorMenu.menuManagement")}</h1>
            <p className="text-muted-foreground">{t("vendorMenu.addEditOrRemoveDishes")}</p>
          </div>

          <VendorAddDishDialog
            isOpen={isAddOpen}
            onOpenChange={setIsAddOpen}
            form={newItem}
            onChange={setNewItem}
            onSubmit={handleSubmit}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            uploading={uploading}
            onRemoveImage={removeImage}
            isSubmitting={isAdding}
          />
        </div>

        <VendorMenuGrid
          menu={menu}
          isLoading={isLoading}
          isTogglingId={isTogglingId}
          onEditClick={handleEditClick}
          onDeleteClick={deleteFood}
          onToggleAvailability={(id, isAvailable) => toggleAvailability({ id, isAvailable })}
        />
      </div>

      <VendorEditDishDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        form={editItemForm}
        onChange={setEditItemForm}
        onSubmit={handleEditSubmit}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        uploading={uploading}
        onRemoveImage={removeImage}
        isSubmitting={isUpdating}
      />
    </VendorLayout>
  );
}
