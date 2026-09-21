import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FoodItemForm } from "./FoodItemForm";
import type { FoodItemFormData } from "../vendorMenuTypes";

interface VendorAddDishDialogProps {
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

/** The "Add New Dish" dialog. */
export function VendorAddDishDialog({ isOpen, onOpenChange, form, onChange, onSubmit, getRootProps, getInputProps, isDragActive, uploading, onRemoveImage, isSubmitting }: VendorAddDishDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 px-6 h-11 rounded-xl">
          <Plus className="h-4 w-4" />
          Add New Dish
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Dish</DialogTitle>
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
          submitLabel="Add Item to Menu"
          submitPendingLabel="Adding..."
        />
      </DialogContent>
    </Dialog>
  );
}
