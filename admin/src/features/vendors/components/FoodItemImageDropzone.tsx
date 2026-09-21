import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { Loader2, Upload, X } from "lucide-react";
import { LazyImage } from "@/components/shared/LazyImage";

interface FoodItemImageDropzoneProps {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
  uploading: boolean;
  images: string[];
  onRemoveImage: (index: number) => void;
}

/**
 * The drag-and-drop image uploader + preview thumbnails, shared between
 * the Add and Edit dish dialogs -- both used the exact same markup, one
 * single useDropzone instance in the page routing uploads to whichever
 * form is open (see useVendorMenu's onDrop).
 */
export function FoodItemImageDropzone({ getRootProps, getInputProps, isDragActive, uploading, images, onRemoveImage }: FoodItemImageDropzoneProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Images</label>
      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
        <input {...getInputProps()} />
        {uploading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
        <p className="text-sm font-medium">Drag & drop images, or click to select</p>
        <p className="text-xs text-muted-foreground">Upload up to 5 images for this dish</p>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {images.map((url, i) => (
            <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border border-border">
              <LazyImage src={url} alt="" className="h-full w-full object-cover" wrapperClassName="h-full w-full" />
              <button type="button" onClick={() => onRemoveImage(i)} className="absolute top-1 right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
