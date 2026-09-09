import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VendorFiltersProps {
  filterSearch: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterVeg: string;
  onVegChange: (value: string) => void;
}

/**
 * The vendor list's search + status + dietary filters. Native `<select>`s,
 * not the shared FilterBar (a custom dropdown-button design) -- kept as
 * originally built since swapping would visibly change how they look.
 */
export function VendorFilters({ filterSearch, onSearchChange, filterStatus, onStatusChange, filterVeg, onVegChange }: VendorFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by restaurant name or location..." value={filterSearch} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 w-full" />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
      >
        <option value="all">All Statuses</option>
        <option value="approved">Approved</option>
        <option value="submitted">Submitted</option>
        <option value="draft">Draft</option>
        <option value="rejected">Rejected</option>
      </select>
      <select
        value={filterVeg}
        onChange={(e) => onVegChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
      >
        <option value="all">All Dietary</option>
        <option value="veg">Pure Veg</option>
        <option value="nonveg">Multi-Cuisine</option>
      </select>
    </div>
  );
}
