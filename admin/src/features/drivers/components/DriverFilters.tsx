import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusFilterOption {
  value: string;
  label: string;
}

interface DriverFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilterOptions: StatusFilterOption[];
  onStatusFilterChange: (value: string) => void;
  onAddClick: () => void;
}

/** Fleet Directory tab's header row: search input, status filter dropdown, and the Onboard button. */
export function DriverFilters({
  searchQuery,
  onSearchChange,
  statusFilterOptions,
  onStatusFilterChange,
  onAddClick,
}: DriverFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-64">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search drivers..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-muted/30 border-border"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          {statusFilterOptions.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => onStatusFilterChange(option.value)} className="cursor-pointer">
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <UserPlus className="h-4 w-4" /> Onboard New Driver
      </button>
    </div>
  );
}
