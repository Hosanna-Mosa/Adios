import { PlusCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MenuItemsEditTable } from "./MenuItemsEditTable";
import type { MenuItem, RestaurantForm } from "../restaurantMenuTypes";

interface RestaurantEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: RestaurantForm;
  setEditForm: (form: RestaurantForm) => void;
  editMenu: MenuItem[];
  setEditMenu: (items: MenuItem[]) => void;
  isLoadingMenu: boolean;
  onUploadImage: (file: File, index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

/** The "Edit Restaurant & Menu" dialog. */
export function RestaurantEditDialog({
  isOpen,
  onOpenChange,
  editForm,
  setEditForm,
  editMenu,
  setEditMenu,
  isLoadingMenu,
  onUploadImage,
  onSubmit,
  isSaving,
}: RestaurantEditDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#00665c]">{t("catalog.editRestaurantAndMenu")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">{t("catalog.restaurantName")}</Label>
              <Input id="edit-name" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">{t("catalog.phone")}</Label>
              <Input id="edit-phone" required value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">{t("catalog.email")}</Label>
              <Input id="edit-email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5 flex items-center gap-3 pt-6">
              <Switch id="edit-isPureVeg" checked={editForm.isPureVeg} onCheckedChange={(checked) => setEditForm({ ...editForm, isPureVeg: checked })} />
              <Label htmlFor="edit-isPureVeg" className="cursor-pointer font-semibold">
                {t("catalog.pureVegetarian")}
              </Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-address">{t("catalog.address")}</Label>
            <Input id="edit-address" required value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="rounded-xl" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-foreground text-sm">{t("catalog.menuItems")}</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditMenu([...editMenu, { name: t("catalog.newItem"), price: 100, description: "", category: t("catalog.generalCategory"), isVeg: true }])}
                className="rounded-xl flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> {t("catalog.addItem")}
              </Button>
            </div>

            {isLoadingMenu ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <Loader2 className="h-6 w-6 text-[#00665c] animate-spin" />
                <p className="text-muted-foreground text-xs">{t("catalog.loadingMenuItems")}</p>
              </div>
            ) : (
              <MenuItemsEditTable items={editMenu} onChange={setEditMenu} onUploadImage={onUploadImage} maxHeightClassName="max-h-[30vh]" />
            )}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="submit" disabled={isSaving} className="bg-[#00665c] hover:bg-[#005249] rounded-xl px-6 flex items-center gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("vendorMenu.saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
