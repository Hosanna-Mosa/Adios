import { Edit, Trash2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/shared/LazyImage";
import type { MenuItem } from "../restaurantMenuTypes";

interface MenuItemsEditTableProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  onUploadImage: (file: File, index: number) => void;
  /** Max-height class for the scrollable wrapper -- the Add wizard's step 3
   *  and the Edit dialog use different values (40vh vs 30vh) since they sit
   *  in differently-sized dialogs. */
  maxHeightClassName: string;
}

/**
 * The editable menu-items table, shared between the Add Restaurant wizard's
 * step 3 (review AI-extracted items) and the Edit Restaurant dialog (edit
 * the saved menu) -- these were ~140 lines of near-identical duplicated
 * JSX in the original page, differing only in which state array they
 * updated. Every button is explicitly `type="button"`: the Edit dialog
 * wraps this table in a `<form>` (so it needs this to avoid submitting on
 * click), while the Add wizard's step 3 does not (where it's a no-op
 * either way) -- one shared component has to be correct in both contexts.
 */
export function MenuItemsEditTable({ items, onChange, onUploadImage, maxHeightClassName }: MenuItemsEditTableProps) {
  const { t } = useTranslation();
  const updateItem = <K extends keyof MenuItem>(idx: number, key: K, value: MenuItem[K]) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [key]: value };
    onChange(updated);
  };

  return (
    <div className={`border border-border rounded-2xl overflow-hidden bg-white ${maxHeightClassName} overflow-y-auto`}>
      <table className="w-full text-sm text-left">
        <thead className="bg-[#f8fafc] border-b text-xs font-bold text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 w-16">{t("catalog.photo")}</th>
            <th className="px-4 py-3">{t("catalog.itemName")}</th>
            <th className="px-4 py-3 w-28">{t("catalog.price")}</th>
            <th className="px-4 py-3">{t("catalog.category")}</th>
            <th className="px-4 py-3">{t("catalog.description")}</th>
            <th className="px-4 py-3 w-20">{t("catalog.vegQuestion")}</th>
            <th className="px-4 py-3 w-16">{t("orders.action")}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item, idx) => (
            <tr key={idx} className="hover:bg-muted/30">
              <td className="px-4 py-2 text-center">
                <div className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  {item.images && item.images.length > 0 ? (
                    <LazyImage src={item.images[0]} alt="item" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
                  ) : (
                    <Upload className="h-4 w-4 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            onUploadImage(e.target.files[0], idx);
                          }
                        }}
                      />
                      <Edit className="h-4 w-4 text-white" />
                    </label>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2">
                <Input value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} className="h-8 rounded-lg" />
              </td>
              <td className="px-4 py-2">
                <Input type="number" value={item.price} onChange={(e) => updateItem(idx, "price", Number(e.target.value) || 0)} className="h-8 rounded-lg" />
              </td>
              <td className="px-4 py-2">
                <Input value={item.category} onChange={(e) => updateItem(idx, "category", e.target.value)} className="h-8 rounded-lg" />
              </td>
              <td className="px-4 py-2">
                <Input value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="h-8 rounded-lg" />
              </td>
              <td className="px-4 py-2 text-center">
                <input type="checkbox" checked={item.isVeg} onChange={(e) => updateItem(idx, "isVeg", e.target.checked)} className="h-4 w-4 accent-[#00665c]" />
              </td>
              <td className="px-4 py-2 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange(items.filter((_, i) => i !== idx))}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
