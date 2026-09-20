import { Plus, PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BulkUploadPanel } from "./BulkUploadPanel";
import { MenuItemsEditTable } from "./MenuItemsEditTable";
import type { MenuItem, RestaurantForm } from "../restaurantMenuTypes";

interface RestaurantAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  step: number;
  setStep: (step: number) => void;
  restaurantForm: RestaurantForm;
  setRestaurantForm: (form: RestaurantForm) => void;
  onNext: (e: React.FormEvent) => void;
  menuImages: File[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onExtract: () => void;
  isExtracting: boolean;
  extractedMenu: MenuItem[];
  setExtractedMenu: (items: MenuItem[]) => void;
  onUploadImage: (file: File, index: number) => void;
  onSave: () => void;
  isSaving: boolean;
}

/** The "Add Restaurant Menu" 3-step wizard dialog. */
export function RestaurantAddDialog({
  isOpen,
  onOpenChange,
  step,
  setStep,
  restaurantForm,
  setRestaurantForm,
  onNext,
  menuImages,
  onImageChange,
  onRemoveImage,
  onExtract,
  isExtracting,
  extractedMenu,
  setExtractedMenu,
  onUploadImage,
  onSave,
  isSaving,
}: RestaurantAddDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#00665c] hover:bg-[#005249] text-white flex items-center gap-2 px-5 py-6 rounded-2xl shadow-md transition-all">
          <Plus className="h-5 w-5" /> Add Restaurant Menu
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#00665c]">
            {step === 1 && "Step 1: Restaurant Details"}
            {step === 2 && "Step 2: Upload Menu Images"}
            {step === 3 && "Step 3: Review & Edit Extracted Menu"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <form onSubmit={onNext} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Grand Bawarchi"
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={restaurantForm.phone}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  placeholder="e.g. info@bawarchi.com"
                  value={restaurantForm.email}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, email: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5 flex items-center gap-3 pt-6">
                <Switch id="isPureVeg" checked={restaurantForm.isPureVeg} onCheckedChange={(checked) => setRestaurantForm({ ...restaurantForm, isPureVeg: checked })} />
                <Label htmlFor="isPureVeg" className="cursor-pointer font-semibold">
                  Pure Vegetarian Restaurant
                </Label>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                required
                placeholder="e.g. 12-3-4, Main Road, Rajahmundry"
                value={restaurantForm.address}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button type="submit" className="bg-[#00665c] hover:bg-[#005249] rounded-xl px-6">
                Next: Upload Menu
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 2 && (
          <BulkUploadPanel
            menuImages={menuImages}
            onImageChange={onImageChange}
            onRemoveImage={onRemoveImage}
            onBack={() => setStep(1)}
            onExtract={onExtract}
            isExtracting={isExtracting}
          />
        )}

        {step === 3 && (
          <div className="space-y-6 py-4">
            <div className="bg-[#f0fdfa] border border-teal-200 p-4 rounded-xl text-sm text-[#00665c] font-medium">
              ✨ AI extracted the following menu items. Please review, edit, or add/delete items below.
            </div>

            <MenuItemsEditTable items={extractedMenu} onChange={setExtractedMenu} onUploadImage={onUploadImage} maxHeightClassName="max-h-[40vh]" />

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExtractedMenu([...extractedMenu, { name: "New Food Item", price: 100, description: "", category: "General", isVeg: true }])}
                className="rounded-xl flex items-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" /> Add Item
              </Button>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl">
                Back
              </Button>
              <Button onClick={onSave} disabled={isSaving} className="bg-[#00665c] hover:bg-[#005249] rounded-xl px-6 flex items-center gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Restaurant & Menu
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
