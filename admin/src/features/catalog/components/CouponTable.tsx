import { Calendar, Check, Ticket, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import type { Coupon } from "../couponTypes";

const DISCOUNT_TYPE_LABEL_KEY: Record<string, string> = {
  PERCENTAGE: "catalog.percentageOption",
  FLAT: "catalog.flatOption",
};

interface CouponTableProps {
  coupons: Coupon[];
  isLoading: boolean;
  isExpired: (coupon: Coupon) => boolean;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string, code: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}

/** The coupons list table + pagination. */
export function CouponTable({ coupons, isLoading, isExpired, onToggleStatus, onDelete, currentPage, totalPages, onPageChange, totalCount }: CouponTableProps) {
  const { t } = useTranslation();
  const columns: DataTableColumn<Coupon>[] = [
    {
      key: "code",
      header: t("catalog.codeAndType"),
      cell: (coupon) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground tracking-wide">{coupon.code}</p>
            <p className="text-[10px] text-muted-foreground">{t(DISCOUNT_TYPE_LABEL_KEY[coupon.discountType] || DISCOUNT_TYPE_LABEL_KEY.PERCENTAGE)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "discount",
      header: t("catalog.discountDetails"),
      cell: (coupon) => (
        <>
          <p className="font-semibold text-foreground">{coupon.discountType === "PERCENTAGE" ? t("catalog.percentOff", { value: coupon.discountValue, defaultValue: "{{value}}% Off" }) : t("catalog.rupeeOff", { value: coupon.discountValue, defaultValue: "₹{{value}} Off" })}</p>
          {coupon.maxDiscount && <p className="text-[10px] text-muted-foreground">{t("catalog.maxDiscountColon", { value: coupon.maxDiscount, defaultValue: "Max Discount: ₹{{value}}" })}</p>}
        </>
      ),
    },
    {
      key: "minOrder",
      header: t("catalog.minOrder"),
      cell: (coupon) => <p className="text-foreground font-medium">₹{coupon.minOrderValue || 0}</p>,
    },
    {
      key: "usage",
      header: t("catalog.usage"),
      cell: (coupon) => <p className="text-foreground font-semibold">{coupon.usageCount || 0}</p>,
    },
    {
      key: "expires",
      header: t("catalog.expires"),
      cellClassName: "px-6 py-4 text-muted-foreground flex items-center gap-1.5 py-6",
      cell: (coupon) => (
        <>
          <Calendar className="h-3.5 w-3.5" />
          <span>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : t("catalog.never")}</span>
          {isExpired(coupon) && <span className="text-[10px] font-bold uppercase text-destructive">{t("catalog.expired")}</span>}
        </>
      ),
    },
    {
      key: "status",
      header: t("users.status"),
      cell: (coupon) => (
        <button
          onClick={() => onToggleStatus(coupon._id)}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all uppercase flex items-center gap-1 ${
            coupon.isActive ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {coupon.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {coupon.isActive ? t("catalog.active") : t("catalog.paused")}
        </button>
      ),
    },
    {
      key: "action",
      header: t("orders.action"),
      cell: (coupon) => (
        <button onClick={() => onDelete(coupon._id, coupon.code)} className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="section-card overflow-hidden">
      <DataTable
        columns={columns}
        data={coupons}
        rowKey={(coupon) => coupon._id}
        isLoading={isLoading}
        loadingLabel={t("catalog.loadingCoupons")}
        emptyLabel={t("catalog.noPromoCouponsActiveDesc")}
        headerRowClassName="bg-muted/50"
        rowClassName="border-t border-border hover:bg-muted/30 transition-colors text-sm"
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} itemLabel={t("catalog.couponsLower")} shownCount={coupons.length} totalCount={totalCount} />
    </div>
  );
}
