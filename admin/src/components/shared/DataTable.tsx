import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeIn } from "@/components/motion/variants";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  headerClassName?: string;
  cell: (item: T) => ReactNode;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (item: T) => string | number;
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  emptyLabel?: ReactNode;
  /** Either a fixed class for every row, or a function for per-row classes (e.g. Zones.tsx's selected-row highlight). */
  rowClassName?: string | ((item: T) => string);
  /** Row click handler, e.g. Zones.tsx's click-to-select-on-map. Omitted by default (rows aren't clickable). */
  onRowClick?: (item: T) => void;
  /** Class for the `<thead><tr>` wrapper. Defaults to Users.tsx's original value. */
  headerRowClassName?: string;
  /** Class for the loading/empty state's single colSpan `<td>`. Defaults to Users.tsx's original value. */
  stateCellClassName?: string;
  /** Class for the `<tbody>` itself, e.g. Drivers.tsx's `"divide-y divide-border"` row dividers. Omitted by default, matching Users.tsx (which had none). */
  tbodyClassName?: string;
  /** Class for the `<table>` element itself. Defaults to Users.tsx's original value. */
  tableClassName?: string;
  /** Class for the `<thead>` element itself, e.g. RestaurantMenu.tsx's header background/text styling (which lives on `<thead>` there, not the header `<tr>`). Omitted by default, matching Users.tsx (which had none). */
  theadClassName?: string;
}

const DEFAULT_HEADER_CLASS = "table-header-text text-left px-6 py-3";
const DEFAULT_CELL_CLASS = "px-6 py-4";
const DEFAULT_ROW_CLASS = "border-t border-border hover:bg-muted/30 transition-colors";
const DEFAULT_HEADER_ROW_CLASS = "border-t border-border";
const DEFAULT_STATE_CELL_CLASS = "px-6 py-10 text-center text-muted-foreground";

/**
 * Plain `<table>` list renderer — replaces the raw `.map()` most list pages
 * hand-wrote. Purely presentational: it receives columns + data via props
 * and knows nothing about where either comes from (no fetching, no API
 * client). Preserves the exact markup/classes/animation every page used:
 * a `motion.tr` per row with the shared `fadeIn` variant inside an
 * `AnimatePresence mode="popLayout"`, and a single colSpan row for the
 * loading/empty states.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  loadingLabel = "Loading...",
  emptyLabel = "No results found.",
  rowClassName,
  onRowClick,
  headerRowClassName,
  stateCellClassName,
  tbodyClassName,
  tableClassName,
  theadClassName,
}: DataTableProps<T>) {
  return (
    <table className={tableClassName ?? "w-full"}>
      <thead className={theadClassName}>
        <tr className={headerRowClassName ?? DEFAULT_HEADER_ROW_CLASS}>
          {columns.map((column) => (
            <th key={column.key} className={column.headerClassName ?? DEFAULT_HEADER_CLASS}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={tbodyClassName}>
        {isLoading ? (
          <tr>
            <td colSpan={columns.length} className={stateCellClassName ?? DEFAULT_STATE_CELL_CLASS}>
              {loadingLabel}
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className={stateCellClassName ?? DEFAULT_STATE_CELL_CLASS}>
              {emptyLabel}
            </td>
          </tr>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {data.map((item) => (
              <motion.tr
                key={rowKey(item)}
                layout
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={typeof rowClassName === "function" ? rowClassName(item) : (rowClassName ?? DEFAULT_ROW_CLASS)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={column.cellClassName ?? DEFAULT_CELL_CLASS}>
                    {column.cell(item)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        )}
      </tbody>
    </table>
  );
}
