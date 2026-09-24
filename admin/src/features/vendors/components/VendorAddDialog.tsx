import { Plus, MapPin, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { NewVendorForm, PlaceDetails, PlaceSuggestion } from "../types";

interface VendorAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newVendor: NewVendorForm;
  onChange: (form: NewVendorForm) => void;
  searchQuery: string;
  suggestions: PlaceSuggestion[];
  isSearching: boolean;
  selectedPlace: PlaceDetails | null;
  onSearch: (value: string) => void;
  onSelectSuggestion: (suggestion: PlaceSuggestion) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

/** The "Add New Restaurant" dialog: Google Places search, then contact details. */
export function VendorAddDialog({
  isOpen,
  onOpenChange,
  newVendor,
  onChange,
  searchQuery,
  suggestions,
  isSearching,
  selectedPlace,
  onSearch,
  onSelectSuggestion,
  onSubmit,
  isSubmitting,
}: VendorAddDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("catalog.addVendor")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("catalog.addNewRestaurant")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">{t("catalog.country")}</label>
              <Input value={newVendor.country} onChange={(e) => onChange({ ...newVendor, country: e.target.value })} placeholder="India" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">{t("catalog.state")}</label>
              <Input value={newVendor.state} onChange={(e) => onChange({ ...newVendor, state: e.target.value })} placeholder="Telangana" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">{t("catalog.city")}</label>
              <Input value={newVendor.city} onChange={(e) => onChange({ ...newVendor, city: e.target.value })} placeholder="Hyderabad" className="h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("catalog.searchGoogleMaps")}</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder={t("catalog.startTypingRestaurantName")} className="pl-9" />

              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-[200px] overflow-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s.place_id}
                      type="button"
                      onClick={() => onSelectSuggestion(s)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
                    >
                      <p className="font-medium text-foreground">{s.structured_formatting?.main_text || s.description}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{s.structured_formatting?.secondary_text || s.description}</p>
                    </button>
                  ))}
                </div>
              )}
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {selectedPlace && (
              <div className="mt-2 p-3 bg-muted rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{selectedPlace.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPlace.formatted_address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("catalog.email")}</label>
              <Input type="email" value={newVendor.email} onChange={(e) => onChange({ ...newVendor, email: e.target.value })} placeholder="owner@restaurant.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("catalog.phone")}</label>
              <Input value={newVendor.phone} onChange={(e) => onChange({ ...newVendor, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("catalog.vendorPassword")}</label>
            <Input type="password" value={newVendor.password} onChange={(e) => onChange({ ...newVendor, password: e.target.value })} placeholder={t("catalog.setPasswordForVendorLogin")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("catalog.addingEllipsis") : t("catalog.confirmAndSaveVendor")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
