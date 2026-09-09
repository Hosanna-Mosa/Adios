import { ReactNode } from "react";
import { StaggerList } from "@/components/motion/StaggerList";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";

interface StatCardConfig {
  icon?: ReactNode;
  label: string;
  value: string;
  badge?: string;
  badgeColor?: "success" | "destructive" | "primary" | "muted";
  subtitle?: string;
}

interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  shownCount?: number;
  totalCount?: number;
}

interface ListPageShellProps {
  /** Top row of StatCards, e.g. Total/Customers/Drivers/Admins. Omit for
   *  pages that don't show one. */
  stats?: StatCardConfig[];
  title: string;
  description?: string;
  /** The FilterBar (or any other controls) rendered next to the header. */
  filterBar?: ReactNode;
  /** The list itself — a <DataTable> directly, or a feature component that
   *  wraps one (e.g. UserTable). ListPageShell doesn't need to know which:
   *  it only owns the header/filter/pagination skeleton around it. */
  table: ReactNode;
  pagination?: PaginationConfig;
  /** Dialogs and other page-level overlays, rendered as siblings after the
   *  section-card — same position they occupied before this shell existed.
   *  Dialog content itself portals to document.body, so this placement has
   *  no effect on where it visually renders. */
  children?: ReactNode;
}

/**
 * The header + filters + table + pagination skeleton that almost every list
 * page rebuilt by hand. Composes the other shared pieces (StatCard,
 * PageHeader, Pagination) around data/handlers passed in as props — it
 * fetches nothing and knows no business logic itself.
 */
export function ListPageShell({
  stats,
  title,
  description,
  filterBar,
  table,
  pagination,
  children,
}: ListPageShellProps) {
  return (
    <>
      <div className="space-y-6">
        {stats && stats.length > 0 && (
          <StaggerList className="grid grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <StaggerItem key={idx}>
                <StatCard {...stat} />
              </StaggerItem>
            ))}
          </StaggerList>
        )}

        <div className="section-card">
          <div className="flex items-center justify-between p-6 pb-4">
            <PageHeader title={title} description={description} />
            {filterBar}
          </div>

          {table}

          {pagination && <Pagination {...pagination} />}
        </div>
      </div>
      {children}
    </>
  );
}
