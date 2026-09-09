import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkUploadPanelProps {
  menuImages: File[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onBack: () => void;
  onExtract: () => void;
  isExtracting: boolean;
}

/** Step 2 of the Add Restaurant wizard: bulk menu-image upload before AI OCR extraction. */
export function BulkUploadPanel({ menuImages, onImageChange, onRemoveImage, onBack, onExtract, isExtracting }: BulkUploadPanelProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="border-2 border-dashed border-[#00665c]/30 rounded-2xl p-8 flex flex-col items-center justify-center bg-[#f2faf9] hover:bg-[#e6f5f3] transition-all relative">
        <input type="file" multiple accept="image/*" onChange={onImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        <Upload className="h-12 w-12 text-[#00665c] mb-3" />
        <p className="text-sm font-semibold text-[#00665c]">Click or Drag & Drop menu images here</p>
        <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, JPEG (Max 5 files)</p>
      </div>

      {menuImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected Files</h4>
          <div className="flex flex-wrap gap-2">
            {menuImages.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white border border-[#00665c]/20 px-3 py-1.5 rounded-xl text-xs font-medium text-[#00665c]">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
                  className="text-muted-foreground hover:text-destructive p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          Back
        </Button>
        <Button onClick={onExtract} disabled={isExtracting || menuImages.length === 0} className="bg-[#00665c] hover:bg-[#005249] rounded-xl px-6 flex items-center gap-2">
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Extracting exact text...
            </>
          ) : (
            "Extract & Parse Menu"
          )}
        </Button>
      </div>
    </div>
  );
}
