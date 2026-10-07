import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useOffers } from "@/features/catalog/hooks/useOffers";
import { OfferForm } from "@/features/catalog/components/OfferForm";
import { OfferTable } from "@/features/catalog/components/OfferTable";

export default function Offers() {
  const { t } = useTranslation();
  const {
    offers,
    isLoading,
    restaurants,
    isLoadingRestaurants,
    isDialogOpen,
    setIsDialogOpen,
    editingOffer,
    formData,
    setFormData,
    uploading,
    handleImageUpload,
    handleEdit,
    handleSubmit,
    isSaving,
    handleDelete,
    toggleStatus,
    isExpired,
    isScheduled,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedOffers,
  } = useOffers();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("offers.restaurantOffers")}</h1>
            <p className="text-muted-foreground">{t("offers.manageOffersDesc")}</p>
          </div>
          <OfferForm
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            isEditing={!!editingOffer}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            isSaving={isSaving}
            restaurants={restaurants}
            isLoadingRestaurants={isLoadingRestaurants}
            uploading={uploading}
            onFileUpload={handleImageUpload}
          />
        </div>

        <OfferTable
          offers={paginatedOffers}
          isLoading={isLoading}
          isExpired={isExpired}
          isScheduled={isScheduled}
          onEdit={handleEdit}
          onToggleStatus={toggleStatus}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalCount={offers.length}
        />
      </div>
    </DashboardLayout>
  );
}
