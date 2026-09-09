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
  loadingLabel?: string;
  emptyLabel?: string;
  rowClassName?: string;
}

const DEFAULT_HEADER_CLASS = "table-header-text text-left px-6 py-3";
const DEFAULT_CELL_CLASS = "px-6 py-4";
const DEFAULT_ROW_CLASS = "border-t border-border hover:bg-muted/30 transition-colors";

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
}: DataTableProps<T>) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-t border-border">
          {columns.map((column) => (
            <th key={column.key} className={column.headerClassName ?? DEFAULT_HEADER_CLASS}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-10 text-center text-muted-foreground">
              {loadingLabel}
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-6 py-10 text-center text-muted-foreground">
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
                className={rowClassName ?? DEFAULT_ROW_CLASS}
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
