import { ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FilterBarOption {
  value: string;
  label: string;
}

export interface FilterBarDropdown {
  /** Current selected value, shown in the trigger as `Filter: {value}`
   *  unless `triggerLabel` is given. */
  value: string;
  onChange: (value: string) => void;
  options: FilterBarOption[];
  /** Defaults to `Filter: {value}`, matching the original hand-rolled markup. */
  triggerLabel?: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Zero or more single-select filter dropdowns, rendered left to right
   *  between the search box and `actions`. */
  filters?: FilterBarDropdown[];
  /** Trailing buttons, e.g. an "Add User" button. */
  actions?: ReactNode;
  className?: string;
}

/** The search input + filter dropdown(s) + action buttons row that sat next
 *  to a list page's header. Generic — knows nothing about what it's
 *  filtering; the page supplies the options and owns the state. */
export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  actions,
  className,
}: FilterBarProps) {
  const { t } = useTranslation();
  return (
    <div className={className ?? "flex gap-3"}>
      <div className="relative w-64">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder ?? t("common.searchEllipsis")}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-muted/30 border-border"
        />
      </div>
      {filters.map((filter, idx) => (
        <DropdownMenu key={idx}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted/50">
              <SlidersHorizontal className="h-4 w-4" /> {filter.triggerLabel ?? t("common.filterColon", { value: filter.value, defaultValue: "Filter: {{value}}" })}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {filter.options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => filter.onChange(option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
      {actions}
    </div>
  );
}
