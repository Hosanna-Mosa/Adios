import { BadgePercent, Calendar, Check, Pencil, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import type { Offer } from "../offerTypes";

interface OfferTableProps {
  offers: Offer[];
  isLoading: boolean;
  isExpired: (offer: Offer) => boolean;
  isScheduled: (offer: Offer) => boolean;
  onEdit: (offer: Offer) => void;
  onToggleStatus: (offer: Offer) => void;
  onDelete: (offer: Offer) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
}

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : null);

/** The offers list table + pagination. */
export function OfferTable({ offers, isLoading, isExpired, isScheduled, onEdit, onToggleStatus, onDelete, currentPage, totalPages, onPageChange, totalCount }: OfferTableProps) {
  const { t } = useTranslation();
  const columns: DataTableColumn<Offer>[] = [
    {
      key: "offer",
      header: t("offers.offer"),
      cell: (offer) => (
        <div className="flex items-center gap-3">
          {offer.imageUrl ? (
            <img src={offer.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover border border-border" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BadgePercent className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate max-w-[220px]">{offer.title}</p>
            {offer.description && <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">{offer.description}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "restaurant",
      header: t("offers.restaurant"),
      cell: (offer) => <p className="text-foreground font-medium">{offer.vendor?.name || <span className="text-destructive">{t("offers.restaurantMissing")}</span>}</p>,
    },
    {
      key: "discount",
      header: t("catalog.discountDetails"),
      cell: (offer) => (
        <>
          <p className="font-semibold text-foreground">
            {offer.discountType === "PERCENTAGE"
              ? t("catalog.percentOff", { value: offer.discountValue, defaultValue: "{{value}}% Off" })
              : t("catalog.rupeeOff", { value: offer.discountValue, defaultValue: "₹{{value}} Off" })}
          </p>
          {offer.maxDiscount ? <p className="text-[10px] text-muted-foreground">{t("catalog.maxDiscountColon", { value: offer.maxDiscount, defaultValue: "Max Discount: ₹{{value}}" })}</p> : null}
          {offer.minOrderValue ? <p className="text-[10px] text-muted-foreground">{t("offers.minOrderColon", { value: offer.minOrderValue, defaultValue: "Min order: ₹{{value}}" })}</p> : null}
        </>
      ),
    },
    {
      key: "code",
      header: t("offers.couponCode"),
      cell: (offer) => (offer.couponCode ? <span className="font-mono font-bold tracking-wide text-foreground">{offer.couponCode}</span> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: "window",
      header: t("offers.validity"),
      cell: (offer) => (
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            {formatDate(offer.startDate) || t("offers.now")} – {formatDate(offer.endDate) || t("catalog.never")}
          </span>
          {isExpired(offer) && <span className="text-[10px] font-bold uppercase text-destructive">{t("catalog.expired")}</span>}
          {isScheduled(offer) && <span className="text-[10px] font-bold uppercase text-amber-600">{t("offers.scheduled")}</span>}
        </div>
      ),
    },
    {
      key: "order",
      header: t("catalog.displayOrder"),
      cell: (offer) => <p className="text-foreground font-medium">{offer.displayOrder ?? 0}</p>,
    },
    {
      key: "status",
      header: t("users.status"),
      cell: (offer) => (
        <button
          onClick={() => onToggleStatus(offer)}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-all uppercase flex items-center gap-1 ${
            offer.isActive ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {offer.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {offer.isActive ? t("catalog.active") : t("catalog.paused")}
        </button>
      ),
    },
    {
      key: "action",
      header: t("orders.action"),
      cell: (offer) => (
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(offer)} aria-label={t("offers.editOffer")} className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(offer)} aria-label={t("offers.deleteOffer")} className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="section-card overflow-hidden">
      <DataTable
        columns={columns}
        data={offers}
        rowKey={(offer) => offer._id}
        isLoading={isLoading}
        loadingLabel={t("offers.loadingOffers")}
        emptyLabel={t("offers.noOffersYet")}
        headerRowClassName="bg-muted/50"
        rowClassName="border-t border-border hover:bg-muted/30 transition-colors text-sm"
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} itemLabel={t("offers.offersLower")} shownCount={offers.length} totalCount={totalCount} />
    </div>
  );
}
