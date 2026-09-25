import { useTranslation } from "react-i18next";
import type { MenuItem } from "../restaurantMenuTypes";

interface MenuCategoryListProps {
  items: MenuItem[];
}

/** Read-only menu display, grouped by category -- used in the View Menu dialog. */
export function MenuCategoryList({ items }: MenuCategoryListProps) {
  const { t } = useTranslation();
  const grouped = items.reduce(
    (acc, item) => {
      const cat = item.category || t("catalog.generalCategory");
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  return (
    <div className="space-y-6 pt-4">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-sm font-bold text-[#00665c] uppercase tracking-wider border-b pb-1.5">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryItems.map((item, idx) => (
              <div key={idx} className="border border-border p-4 rounded-2xl flex justify-between items-start bg-slate-50/50 hover:bg-slate-50 transition-colors shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full inline-block border ${item.isVeg ? "bg-green-500 border-green-600" : "bg-red-500 border-red-600"}`} />
                    <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                  </div>
                  {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                </div>
                <span className="font-extrabold text-sm text-[#00665c] shrink-0">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
