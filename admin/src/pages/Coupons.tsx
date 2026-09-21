import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCoupons } from "@/features/catalog/hooks/useCoupons";
import { CouponForm } from "@/features/catalog/components/CouponForm";
import { CouponTable } from "@/features/catalog/components/CouponTable";

export default function Coupons() {
  const { coupons, isLoading, isAddOpen, setIsAddOpen, newCoupon, setNewCoupon, handleSubmit, isCreating, isExpired, handleDelete, toggleStatus, currentPage, setCurrentPage, totalPages, paginatedCoupons } =
    useCoupons();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Promo Campaigns & Coupons</h1>
            <p className="text-muted-foreground">Manage active discount programs, platform coupons, and marketing campaigns.</p>
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
