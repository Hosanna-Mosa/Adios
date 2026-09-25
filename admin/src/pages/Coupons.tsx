import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCoupons } from "@/features/catalog/hooks/useCoupons";
import { CouponForm } from "@/features/catalog/components/CouponForm";
import { CouponTable } from "@/features/catalog/components/CouponTable";

export default function Coupons() {
  const { t } = useTranslation();
  const { coupons, isLoading, isAddOpen, setIsAddOpen, newCoupon, setNewCoupon, handleSubmit, isCreating, isExpired, handleDelete, toggleStatus, currentPage, setCurrentPage, totalPages, paginatedCoupons } =
    useCoupons();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("catalog.promoCampaignsAndCoupons")}</h1>
            <p className="text-muted-foreground">{t("catalog.manageDiscountProgramsDesc")}</p>
          </div>
          <CouponForm isOpen={isAddOpen} onOpenChange={setIsAddOpen} newCoupon={newCoupon} onChange={setNewCoupon} onSubmit={handleSubmit} isCreating={isCreating} />
        </div>

        <CouponTable
          coupons={paginatedCoupons}
          isLoading={isLoading}
          isExpired={isExpired}
          onToggleStatus={toggleStatus}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalCount={coupons.length}
        />
      </div>
    </DashboardLayout>
  );
}
