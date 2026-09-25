import { Edit2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LazyImage } from "@/components/shared/LazyImage";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Switch } from "@/components/ui/switch";
import { isInStock } from "../hooks/useVendorMenu";
import type { FoodItem } from "../vendorMenuTypes";

interface FoodItemCardProps {
  item: FoodItem;
  isToggling: boolean;
  onEditClick: (item: FoodItem) => void;
  onDeleteClick: (id: string) => void;
  onToggleAvailability: (isAvailable: boolean) => void;
}

/** One dish tile in the vendor's menu grid. */
export function FoodItemCard({ item, isToggling, onEditClick, onDeleteClick, onToggleAvailability }: FoodItemCardProps) {
  const { t } = useTranslation();
  const inStock = isInStock(item);

  return (
    <StaggerItem className={`bg-card border overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition-all group ${inStock ? "border-border" : "border-dashed border-muted-foreground/40 opacity-75"}`}>
      <div className="h-48 w-full relative overflow-hidden">
        <LazyImage
          src={item.images[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          wrapperClassName="h-full w-full"
        />
        <div className="absolute top-4 left-4 h-6 w-6 rounded border border-white bg-white/20 backdrop-blur-md flex items-center justify-center p-1">
          <div className={`h-full w-full rounded-full ${item.isVeg ? "bg-success" : "bg-destructive"}`} />
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => onEditClick(item)} className="h-8 w-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-foreground hover:bg-white transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={() => onDeleteClick(item._id)} className="h-8 w-8 bg-destructive/90 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.category}</span>
          <p className="text-xl font-bold text-foreground">₹{item.price}</p>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">{item.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3">
          <div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${inStock ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{inStock ? t("vendorMenu.inStock") : t("vendorMenu.outOfStock")}</span>
            <p className="text-[11px] text-muted-foreground mt-1.5">{inStock ? t("vendorMenu.customersCanOrderThisDish") : t("vendorMenu.showsAsSoldOutInApp")}</p>
          </div>
          <Switch checked={inStock} onCheckedChange={onToggleAvailability} disabled={isToggling} aria-label={t("vendorMenu.availabilityForItem", { name: item.name, defaultValue: "Availability for {{name}}" })} />
        </div>
      </div>
    </StaggerItem>
  );
}
