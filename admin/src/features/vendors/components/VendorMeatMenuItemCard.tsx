import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Drumstick, Check, X, IndianRupee, Pencil } from "lucide-react";
import { StaggerItem } from "@/components/motion/StaggerItem";
import type { MeatItem } from "../hooks/useVendorMeatMenu";

interface VendorMeatMenuItemCardProps {
  item: MeatItem;
  editingId: string | null;
  editPrice: string;
  setEditPrice: (value: string) => void;
  isToggling: boolean;
  isSavingPrice: boolean;
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void;
  startEditing: (item: MeatItem) => void;
  cancelEditing: () => void;
  savePrice: (itemId: string) => void;
}

/** One meat item's availability/price card in the VendorMeatMenu grid. */
export function VendorMeatMenuItemCard({
  item,
  editingId,
  editPrice,
  setEditPrice,
  isToggling,
  isSavingPrice,
  onToggleAvailability,
  startEditing,
  cancelEditing,
  savePrice,
}: VendorMeatMenuItemCardProps) {
  return (
    <StaggerItem
      className={`bg-card border ${
        item.isAvailable ? "border-border" : "border-dashed border-muted-foreground/30"
      } p-6 rounded-3xl shadow-sm transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
              item.isAvailable ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <Drumstick
              className={`h-7 w-7 ${item.isAvailable ? "text-primary" : "text-muted-foreground"}`}
            />
          </div>
          <div>
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.weight}</p>
            <p className="text-[10px] uppercase text-muted-foreground/60 font-semibold mt-0.5">
              {item.category}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              item.isAvailable
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {item.isAvailable ? "In Stock" : "Out of Stock"}
          </span>
          <Switch
            checked={item.isAvailable}
            onCheckedChange={(val) => onToggleAvailability(item._id, val)}
            disabled={isToggling}
          />
        </div>
      </div>

      {/* Price Section */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Selling Price
          </span>

          {editingId === item._id ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="pl-9 h-9 w-28 text-sm font-semibold"
                  autoFocus
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-success hover:text-success hover:bg-success/10"
                onClick={() => savePrice(item._id)}
                disabled={isSavingPrice}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={cancelEditing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-foreground">₹{item.price}</span>
              <button
                onClick={() => startEditing(item)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </button>
            </div>
          )}
        </div>
      </div>
    </StaggerItem>
  );
}
