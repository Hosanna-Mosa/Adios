import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  shownCount?: number;
  totalCount?: number;
}

/** Page numbers to show: all of them when few, else first/last and a window around the current page ("…" = gap). */
function visiblePages(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["gap" as const, p] : [p]));
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemLabel,
  shownCount,
  totalCount,
}: PaginationProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
      {shownCount !== undefined && totalCount !== undefined ? (
        <p className="text-sm text-muted-foreground">
          {t("pagination.showingXOfY", {
            shown: shownCount,
            total: totalCount,
            item: itemLabel ?? t("pagination.items"),
            defaultValue: "Showing {{shown}} of {{total}} {{item}}",
          })}
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 border border-border rounded text-muted-foreground hover:bg-muted/50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {visiblePages(currentPage, totalPages).map((page, idx) => {
          if (page === "gap") {
            return <span key={`gap-${idx}`} className="px-1 text-muted-foreground">…</span>;
          }
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className="relative h-8 w-8 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {isActive && (
                <motion.span
                  layoutId="pagination-active"
                  className="absolute inset-0 rounded bg-primary"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
              <span className={`relative ${isActive ? "text-primary-foreground" : ""}`}>{page}</span>
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 border border-border rounded text-muted-foreground hover:bg-muted/50 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
