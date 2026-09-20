import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FoodItemForm } from "./FoodItemForm";
import type { FoodItemFormData } from "../vendorMenuTypes";

interface VendorEditDishDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: FoodItemFormData;
  onChange: (form: FoodItemFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
  uploading: boolean;
  onRemoveImage: (index: number) => void;
  isSubmitting: boolean;
}

/** The "Edit Dish" dialog. */
export function VendorEditDishDialog({ isOpen, onOpenChange, form, onChange, onSubmit, getRootProps, getInputProps, isDragActive, uploading, onRemoveImage, isSubmitting }: VendorEditDishDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Dish</DialogTitle>
        </DialogHeader>
        <FoodItemForm
          form={form}
          onChange={onChange}
          onSubmit={onSubmit}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          uploading={uploading}
          onRemoveImage={onRemoveImage}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
          submitPendingLabel="Saving..."
        />
      </DialogContent>
    </Dialog>
  );
}
