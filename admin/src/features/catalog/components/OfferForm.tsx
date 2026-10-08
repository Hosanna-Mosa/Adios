import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BannerUploader } from "./BannerUploader";
import type { OfferDiscountType, OfferFormData, OfferRestaurantOption } from "../offerTypes";

const SELECT_CLASS =
  "w-full rounded-md border border-input bg-background px-3 h-10 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring";

interface OfferFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: OfferFormData;
  onChange: (data: OfferFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  restaurants: OfferRestaurantOption[];
  isLoadingRestaurants: boolean;
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** The "Add/Edit Offer" dialog, including its trigger button. */
export function OfferForm({
  isOpen,
  onOpenChange,
  isEditing,
  formData,
  onChange,
  onSubmit,
  isSaving,
  restaurants,
  isLoadingRestaurants,
  uploading,
  onFileUpload,
}: OfferFormProps) {
  const { t } = useTranslation();
  const [restaurantSearch, setRestaurantSearch] = useState("");

  // Narrow the dropdown by name; the selected restaurant always stays listed.
  const restaurantOptions = useMemo(() => {
    const term = restaurantSearch.trim().toLowerCase();
    const sorted = [...restaurants].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    if (!term) return sorted;
    return sorted.filter((r) => r._id === formData.vendor || (r.name || "").toLowerCase().includes(term));
  }, [restaurants, restaurantSearch, formData.vendor]);

  const set = <K extends keyof OfferFormData>(key: K, value: OfferFormData[K]) => onChange({ ...formData, [key]: value });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> {t("offers.addOffer")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{isEditing ? t("offers.editOffer") : t("offers.newOffer")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="offer-restaurant">{t("offers.restaurant")}</Label>
            <Input
              placeholder={t("offers.searchRestaurants")}
              value={restaurantSearch}
              onChange={(e) => setRestaurantSearch(e.target.value)}
              className="h-9"
            />
            <select
              id="offer-restaurant"
              className={SELECT_CLASS}
              value={formData.vendor}
              onChange={(e) => set("vendor", e.target.value)}
              required
            >
              <option value="">{isLoadingRestaurants ? t("offers.loadingRestaurants") : t("offers.selectRestaurant")}</option>
              {restaurantOptions.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offer-title">{t("catalog.title")}</Label>
            <Input id="offer-title" value={formData.title} onChange={(e) => set("title", e.target.value)} placeholder={t("offers.titlePlaceholder")} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offer-description">{t("catalog.description")}</Label>
            <Textarea
              id="offer-description"
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("offers.descriptionPlaceholder")}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="offer-type">{t("catalog.type")}</Label>
              <select
                id="offer-type"
                className={SELECT_CLASS}
                value={formData.discountType}
                onChange={(e) => set("discountType", e.target.value as OfferDiscountType)}
              >
                <option value="PERCENTAGE">{t("catalog.percentageOption")}</option>
                <option value="FLAT">{t("catalog.flatOption")}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offer-value">{t("catalog.value")}</Label>
              <Input id="offer-value" type="number" min={0} step="any" value={formData.discountValue} onChange={(e) => set("discountValue", e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.discountType === "PERCENTAGE" && (
              <div className="space-y-1.5">
                <Label htmlFor="offer-max">{t("catalog.maxDiscount")}</Label>
                <Input id="offer-max" type="number" min={0} step="any" value={formData.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} placeholder={t("offers.optional")} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="offer-min">{t("catalog.minOrderValue")}</Label>
              <Input id="offer-min" type="number" min={0} step="any" value={formData.minOrderValue} onChange={(e) => set("minOrderValue", e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offer-code">{t("offers.couponCodeOptional")}</Label>
            <Input
              id="offer-code"
              className="uppercase font-bold tracking-wide"
              value={formData.couponCode}
              onChange={(e) => set("couponCode", e.target.value)}
              placeholder="e.g. FEAST50"
            />
          </div>

          <BannerUploader
            imageUrl={formData.imageUrl}
            onImageUrlChange={(value) => set("imageUrl", value)}
            onFileUpload={onFileUpload}
            uploading={uploading}
            required={false}
            label={t("offers.imageOptional")}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="offer-start">{t("offers.startDate")}</Label>
              <Input id="offer-start" type="date" className="text-xs" value={formData.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offer-end">{t("offers.endDate")}</Label>
              <Input id="offer-end" type="date" className="text-xs" value={formData.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="offer-order">{t("catalog.displayOrder")}</Label>
              <Input id="offer-order" type="number" value={formData.displayOrder} onChange={(e) => set("displayOrder", e.target.value)} placeholder="0" />
            </div>
            <div className="flex items-center gap-3 h-10">
              <Switch id="offer-active" checked={formData.isActive} onCheckedChange={(checked) => set("isActive", checked)} />
              <Label htmlFor="offer-active">{t("catalog.active")}</Label>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl h-10 mt-4" disabled={isSaving || uploading}>
            {isSaving ? t("catalog.savingEllipsis") : t("offers.saveOffer")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
