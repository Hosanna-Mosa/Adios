import { Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface BannerUploaderProps {
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

/** The banner form's Image field: a URL input plus a file-upload button that fills it in. */
export function BannerUploader({ imageUrl, onImageUrlChange, onFileUpload, uploading }: BannerUploaderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="imageUrl">Image</Label>
      <div className="flex gap-2">
        <Input id="imageUrl" value={imageUrl} onChange={(e) => onImageUrlChange(e.target.value)} placeholder="https://images.unsplash.com/photo-..." required className="flex-1" />
        <div className="relative">
          <input type="file" accept="image/*" onChange={onFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={uploading} />
          <Button type="button" variant="outline" className="px-3" disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
