import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RestaurantSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  filterDiet: string;
  onDietChange: (value: string) => void;
  filterRating: string;
  onRatingChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  shownCount: number;
  totalCount: number;
}

/**
 * The restaurant list's filter card: name/address search plus dietary and
 * minimum-rating filters (all three compose), a Clear button while any is
 * active, and a "Showing X of Y" count.
 */
export function RestaurantSearchBox({
  value,
  onChange,
  filterDiet,
  onDietChange,
  filterRating,
  onRatingChange,
  hasActiveFilters,
  onClear,
  shownCount,
  totalCount,
}: RestaurantSearchBoxProps) {
  const { t } = useTranslation();
  const selectClass =
    "h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary w-full md:w-auto";
  return (
    <div className="bg-card border border-border p-4 rounded-3xl shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            id="restaurant-search"
            type="text"
            placeholder={t("catalog.searchByRestaurantNameOrAddress")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>

        <select id="restaurant-diet" value={filterDiet} onChange={(e) => onDietChange(e.target.value)} className={selectClass}>
          <option value="all">{t("catalog.allDietary")}</option>
          <option value="veg">{t("catalog.pureVeg")}</option>
          <option value="nonveg">{t("catalog.multiCuisine")}</option>
        </select>

        <select id="restaurant-rating" value={filterRating} onChange={(e) => onRatingChange(e.target.value)} className={selectClass}>
          <option value="all">{t("catalog.anyRating")}</option>
          <option value="4.5">{t("catalog.ratingAndAbove", { rating: "4.5", defaultValue: "{{rating}} & above" })}</option>
          <option value="4">{t("catalog.ratingAndAbove", { rating: "4.0", defaultValue: "{{rating}} & above" })}</option>
          <option value="3">{t("catalog.ratingAndAbove", { rating: "3.0", defaultValue: "{{rating}} & above" })}</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="h-9 px-3 rounded-md border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors w-full md:w-auto"
          >
            {t("catalog.clear")}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t("catalog.showingXOfYRestaurants", { shown: shownCount, total: totalCount, defaultValue: "Showing {{shown}} of {{total}} restaurants" })}
      </p>
    </div>
  );
}
