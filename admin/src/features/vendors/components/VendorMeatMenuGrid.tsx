import { StaggerList } from "@/components/motion/StaggerList";
import { VendorMeatMenuItemCard } from "./VendorMeatMenuItemCard";
import type { MeatItem } from "../hooks/useVendorMeatMenu";

interface VendorMeatMenuGridProps {
  isLoading: boolean;
  menu: MeatItem[] | undefined;
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

/** The loading/empty/grid states for VendorMeatMenu.tsx. */
export function VendorMeatMenuGrid({
  isLoading,
  menu,
  editingId,
  editPrice,
  setEditPrice,
  isToggling,
  isSavingPrice,
  onToggleAvailability,
  startEditing,
  cancelEditing,
  savePrice,
}: VendorMeatMenuGridProps) {
  return (
    <StaggerList className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {isLoading ? (
        <p className="text-muted-foreground col-span-full text-center py-12">Loading your items...</p>
      ) : !menu || menu.length === 0 ? (
        <p className="text-muted-foreground col-span-full text-center py-12">No meat items found for your center.</p>
      ) : (
        menu.map((item) => (
          <VendorMeatMenuItemCard
            key={item._id}
            item={item}
            editingId={editingId}
            editPrice={editPrice}
            setEditPrice={setEditPrice}
            isToggling={isToggling}
            isSavingPrice={isSavingPrice}
            onToggleAvailability={onToggleAvailability}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            savePrice={savePrice}
          />
        ))
      )}
    </StaggerList>
  );
}
