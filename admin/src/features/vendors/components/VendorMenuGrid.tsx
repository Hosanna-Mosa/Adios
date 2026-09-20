import { Utensils } from "lucide-react";
import { StaggerList } from "@/components/motion/StaggerList";
import { FoodItemCard } from "./FoodItemCard";
import type { FoodItem } from "../vendorMenuTypes";

interface VendorMenuGridProps {
  menu: FoodItem[] | undefined;
  isLoading: boolean;
  isTogglingId: string | undefined;
  onEditClick: (item: FoodItem) => void;
  onDeleteClick: (id: string) => void;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
}

/** The vendor's menu grid: loading/empty states, or a card per dish. */
export function VendorMenuGrid({ menu, isLoading, isTogglingId, onEditClick, onDeleteClick, onToggleAvailability }: VendorMenuGridProps) {
  return (
    <StaggerList className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {isLoading ? (
        <p>Loading menu...</p>
      ) : menu?.length === 0 ? (
        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border">
          <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold">Your menu is empty</h3>
          <p className="text-muted-foreground max-w-[300px] mt-1">Start adding dishes to show them to your customers in the app.</p>
        </div>
      ) : (
        menu?.map((item) => (
          <FoodItemCard
            key={item._id}
            item={item}
            isToggling={isTogglingId === item._id}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            onToggleAvailability={(isAvailable) => onToggleAvailability(item._id, isAvailable)}
          />
        ))
      )}
    </StaggerList>
  );
}
