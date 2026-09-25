import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useBanners } from "@/features/catalog/hooks/useBanners";
import { BannerForm } from "@/features/catalog/components/BannerForm";
import { BannerGrid } from "@/features/catalog/components/BannerGrid";

export default function Banners() {
  const { t } = useTranslation();
  const { banners, isLoading, isDialogOpen, setIsDialogOpen, editingBanner, formData, setFormData, uploading, handleImageUpload, handleEdit, handleSubmit, isSaving, handleDelete, toggleStatus, isToggling } =
    useBanners();

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("catalog.bannersAndAds")}</h1>
          <p className="text-gray-500">{t("catalog.managePromotionalBannersDesc")}</p>
        </div>
        <BannerForm
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          isEditing={!!editingBanner}
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          isSaving={isSaving}
          uploading={uploading}
          onFileUpload={handleImageUpload}
        />
      </div>

      <BannerGrid banners={banners} isLoading={isLoading} onToggleStatus={toggleStatus} isToggling={isToggling} onEdit={handleEdit} onDelete={handleDelete} />
    </DashboardLayout>
  );
}
