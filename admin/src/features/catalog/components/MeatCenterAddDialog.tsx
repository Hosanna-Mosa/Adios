import { Plus, MapPin, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { NewMeatCenterForm, PlaceDetails, PlaceSuggestion } from "../meatCenterTypes";

interface MeatCenterAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newCenter: NewMeatCenterForm;
  onChange: (form: NewMeatCenterForm) => void;
  searchQuery: string;
  suggestions: PlaceSuggestion[];
  isSearching: boolean;
  selectedPlace: PlaceDetails | null;
  onSearch: (value: string) => void;
  onSelectSuggestion: (suggestion: PlaceSuggestion) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

/** The "Add New Meat Center" dialog: Google search, then contact details. */
export function MeatCenterAddDialog({
  isOpen,
  onOpenChange,
  newCenter,
  onChange,
  searchQuery,
  suggestions,
  isSearching,
  selectedPlace,
  onSearch,
  onSelectSuggestion,
  onSubmit,
  isSubmitting,
}: MeatCenterAddDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Meat Center
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Meat Center</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">Country</label>
              <Input value={newCenter.country} onChange={(e) => onChange({ ...newCenter, country: e.target.value })} placeholder="India" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">State</label>
              <Input value={newCenter.state} onChange={(e) => onChange({ ...newCenter, state: e.target.value })} placeholder="Telangana" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase text-muted-foreground">City</label>
              <Input value={newCenter.city} onChange={(e) => onChange({ ...newCenter, city: e.target.value })} placeholder="Hyderabad" className="h-9 text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Search on Map</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder="Search meat shop name..." className="pl-9" />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Phone</label>
            <Input value={newCenter.phone} onChange={(e) => onChange({ ...newCenter, phone: e.target.value })} placeholder="+91 98765 43210" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (Login)</label>
              <Input type="email" value={newCenter.email} onChange={(e) => onChange({ ...newCenter, email: e.target.value })} placeholder="shop@example.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={newCenter.password} onChange={(e) => onChange({ ...newCenter, password: e.target.value })} placeholder="Min. 8 characters" required />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Save Meat Center"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
