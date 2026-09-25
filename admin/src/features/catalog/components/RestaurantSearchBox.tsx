import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RestaurantSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * The restaurant list's search input. A card-styled search-only box, not
 * the shared FilterBar's dropdown-pill design -- kept as its own small
 * component rather than forced into FilterBar, which would visibly change
 * how it looks (this refactor's plan puts zero-UI-change ahead of
 * reusability).
 */
export function RestaurantSearchBox({ value, onChange }: RestaurantSearchBoxProps) {
  const { t } = useTranslation();
  return (
    <div className="bg-card border border-border p-4 rounded-3xl flex items-center gap-3 shadow-sm max-w-md">
      <Search className="h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        placeholder={t("catalog.searchByRestaurantNameOrAddress")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none outline-none text-sm w-full"
      />
    </div>
  );
}
