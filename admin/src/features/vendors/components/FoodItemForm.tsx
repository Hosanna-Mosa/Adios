import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FoodItemImageDropzone } from "./FoodItemImageDropzone";
import type { FoodItemFormData } from "../vendorMenuTypes";

interface FoodItemFormProps {
  form: FoodItemFormData;
  onChange: (form: FoodItemFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
  uploading: boolean;
  onRemoveImage: (index: number) => void;
  isSubmitting: boolean;
  submitLabel: string;
  submitPendingLabel: string;
}

/**
 * The dish name/price/category/description/veg-toggle form, shared between
 * the Add and Edit dish dialogs -- these were two ~90-line near-identical
 * copies in the original page, differing only in field values and the
 * submit button's wording.
 */
export function FoodItemForm({ form, onChange, onSubmit, getRootProps, getInputProps, isDragActive, uploading, onRemoveImage, isSubmitting, submitLabel, submitPendingLabel }: FoodItemFormProps) {
  const { t } = useTranslation();
  return (
    <form onSubmit={onSubmit} className="space-y-4 py-4">
      <FoodItemImageDropzone getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} uploading={uploading} images={form.images} onRemoveImage={onRemoveImage} />

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("vendorMenu.dishName")}</label>
        <Input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder={t("vendorMenu.dishNamePlaceholder")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("vendorMenu.priceLabel")}</label>
          <Input type="number" value={form.price} onChange={(e) => onChange({ ...form, price: e.target.value })} placeholder="299" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("vendorMenu.category")}</label>
          <Input value={form.category} onChange={(e) => onChange({ ...form, category: e.target.value })} placeholder={t("vendorMenu.categoryPlaceholder")} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("vendorMenu.description")}</label>
        <Textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} placeholder={t("vendorMenu.descriptionPlaceholder")} />
      </div>

      <div className="flex items-center gap-4 py-2">
        <button
          type="button"
          onClick={() => onChange({ ...form, isVeg: true })}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all ${form.isVeg ? "border-success bg-success/5 text-success" : "border-border text-muted-foreground"}`}
        >
          <div className="h-3 w-3 rounded-full bg-success" />
          {t("vendorMenu.veg")}
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...form, isVeg: false })}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all ${!form.isVeg ? "border-destructive bg-destructive/5 text-destructive" : "border-border text-muted-foreground"}`}
        >
          <div className="h-3 w-3 rounded-full bg-destructive" />
          {t("vendorMenu.nonVeg")}
        </button>
      </div>

      <Button type="submit" className="w-full h-11 rounded-xl mt-4" disabled={isSubmitting || uploading}>
        {isSubmitting ? submitPendingLabel : submitLabel}
      </Button>
    </form>
  );
}
