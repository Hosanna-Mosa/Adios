import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BannerUploader } from "./BannerUploader";
import type { BannerFormData } from "../bannerTypes";

interface BannerFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  formData: BannerFormData;
  onChange: (data: BannerFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** The "Add/Edit Banner" dialog, including its trigger button. */
export function BannerForm({ isOpen, onOpenChange, isEditing, formData, onChange, onSubmit, isSaving, uploading, onFileUpload }: BannerFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Banner" : "Add New Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => onChange({ ...formData, title: e.target.value })} placeholder="e.g. Special Shoe Sale!" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.itemType}
                onValueChange={(value) =>
                  onChange({
                    ...formData,
                    itemType: value,
                    position: value === "banner" ? "hero" : "startup",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner (Hero)</SelectItem>
                  <SelectItem value="ad">Advertisement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={formData.position} onValueChange={(value) => onChange({ ...formData, position: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {formData.itemType === "banner" ? (
                    <SelectItem value="hero">Hero Section (Top)</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="startup">App Startup (Modal)</SelectItem>
                      <SelectItem value="below_greetings">Below Greetings</SelectItem>
                      <SelectItem value="driver_dashboard">Driver Dashboard</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={formData.description} onChange={(e) => onChange({ ...formData, description: e.target.value })} placeholder="e.g. Flat 30% Off on top brands." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={formData.displayOrder}
              onChange={(e) => onChange({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              placeholder="e.g. 1"
            />
          </div>

          {formData.itemType === "banner" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color1">Gradient Color 1 (Optional)</Label>
                <div className="flex gap-2">
                  <Input id="color1" value={formData.color1} onChange={(e) => onChange({ ...formData, color1: e.target.value })} placeholder="#4C1D95" />
                  {formData.color1 && <div className="w-10 h-10 rounded border" style={{ backgroundColor: formData.color1 }} />}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color2">Gradient Color 2 (Optional)</Label>
                <div className="flex gap-2">
                  <Input id="color2" value={formData.color2} onChange={(e) => onChange({ ...formData, color2: e.target.value })} placeholder="#2E1065" />
                  {formData.color2 && <div className="w-10 h-10 rounded border" style={{ backgroundColor: formData.color2 }} />}
                </div>
              </div>
            </div>
          )}

          <BannerUploader imageUrl={formData.imageUrl} onImageUrlChange={(value) => onChange({ ...formData, imageUrl: value })} onFileUpload={onFileUpload} uploading={uploading} />

          <div className="space-y-2">
            <Label htmlFor="targetUrl">Target URL (Optional)</Label>
            <Input id="targetUrl" value={formData.targetUrl} onChange={(e) => onChange({ ...formData, targetUrl: e.target.value })} placeholder="https://..." />
          </div>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Banner"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
