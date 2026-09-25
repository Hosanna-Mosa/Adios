import { Loader2, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MenuCategoryList } from "./MenuCategoryList";
import type { MenuItem, Restaurant } from "../restaurantMenuTypes";

interface RestaurantViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: Restaurant | null;
  menu: MenuItem[];
  isLoading: boolean;
}

/** Read-only "View Menu" dialog for a restaurant. */
export function RestaurantViewDialog({ isOpen, onOpenChange, restaurant, menu, isLoading }: RestaurantViewDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#00665c] flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" /> {t("catalog.restaurantNameMenu", { name: restaurant?.name, defaultValue: "{{name}} Menu" })}
          </DialogTitle>
          <p className="text-muted-foreground text-xs">{restaurant?.address}</p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-[#00665c] animate-spin" />
            <p className="text-muted-foreground text-xs">{t("catalog.loadingMenuItems")}</p>
          </div>
        ) : menu.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-semibold">{t("catalog.noMenuItemsAddedYet")}</p>
          </div>
        ) : (
          <MenuCategoryList items={menu} />
        )}
      </DialogContent>
    </Dialog>
  );
}
