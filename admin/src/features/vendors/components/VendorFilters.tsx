import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder={t("catalog.searchByRestaurantNameLocation")} value={filterSearch} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 w-full" />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
      >
        <option value="all">{t("dashboard.allStatuses")}</option>
        <option value="approved">{t("catalog.approved")}</option>
        <option value="submitted">{t("catalog.submitted")}</option>
        <option value="resubmission_required">{t("catalog.resubmissionRequired")}</option>
        <option value="draft">{t("catalog.draft")}</option>
        <option value="rejected">{t("catalog.rejected")}</option>
      </select>
      <select
        value={filterVeg}
        onChange={(e) => onVegChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
      >
        <option value="all">{t("catalog.allDietary")}</option>
        <option value="veg">{t("catalog.pureVeg")}</option>
        <option value="nonveg">{t("catalog.multiCuisine")}</option>
      </select>
    </div>
  );
}
