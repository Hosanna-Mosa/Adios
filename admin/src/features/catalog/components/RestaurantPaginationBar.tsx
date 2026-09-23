import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface RestaurantPaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  shownFrom: number;
  shownTo: number;
  totalCount: number;
}

/**
 * "Showing X to Y of Z entries" + Previous/Next controls. Kept as its own
 * component rather than the shared Pagination (numbered page buttons,
 * different wording) -- that's a visibly different design, and this
 * refactor's plan puts zero-UI-change ahead of reusability.
 */
export function RestaurantPaginationBar({ currentPage, totalPages, onPageChange, shownFrom, shownTo, totalCount }: RestaurantPaginationBarProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  return (
    <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
      <span className="text-xs font-semibold text-slate-500">
        {t("catalog.showingFromToOfEntries", { from: shownFrom, to: shownTo, total: totalCount, defaultValue: "Showing {{from}} to {{to}} of {{total}} entries" })}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          className="rounded-xl px-4 py-2 text-xs font-bold transition-all border-slate-200/80 bg-white hover:bg-slate-50"
        >
          {t("orders.previous")}
        </Button>
        <span className="text-xs font-bold text-slate-600">
          {t("catalog.pageXOfY", { page: currentPage, total: totalPages, defaultValue: "Page {{page}} of {{total}}" })}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          className="rounded-xl px-4 py-2 text-xs font-bold transition-all border-slate-200/80 bg-white hover:bg-slate-50"
        >
          {t("orders.next")}
        </Button>
      </div>
    </div>
  );
}
