import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { fadeIn } from "@/components/motion/variants";
import { Store, Plus, MoreVertical, Search, MapPin, Star, Drumstick, Edit2, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

type WeeklyHours = Partial<Record<DayKey, DayHours>>;

/** Server-evaluated open/closed verdict returned on every meat-centre row. */
interface OpenState {
  isOpen: boolean;
  label: string;
  opensAt: string | null;
  today: string | null;
  week: { day: string; hours: string }[];
}

interface MeatCenter {
  _id: string;
  name: string;
  address: string;
  rating: number;
  reviews: string;
  phone: string;
  image: string;
  isManuallyClosed?: boolean;
  openingHours?: WeeklyHours;
  openState?: OpenState;
}

const WEEK_DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

type HoursDraft = Record<DayKey, { open: string; close: string; closed: boolean }>;

const toHoursDraft = (hours?: WeeklyHours): HoursDraft =>
  WEEK_DAYS.reduce((draft, { key }) => {
    const day = hours?.[key];
    draft[key] = {
      open: day?.open || "09:00",
      close: day?.close || "22:00",
      closed: day?.closed === true,
    };
    return draft;
  }, {} as HoursDraft);

const toWeeklyHours = (draft: HoursDraft): WeeklyHours =>
  WEEK_DAYS.reduce((hours, { key }) => {
    const day = draft[key];
    hours[key] = day.closed
      ? { open: day.open, close: day.close, closed: true }
      : { open: day.open, close: day.close };
    return hours;
  }, {} as WeeklyHours);

const hasWeeklyHours = (hours?: WeeklyHours) => !!hours && Object.keys(hours).length > 0;

function OpeningHoursEditor({ draft, onChange }: { draft: HoursDraft; onChange: (next: HoursDraft) => void }) {
  const setDay = (key: DayKey, patch: Partial<HoursDraft[DayKey]>) =>
    onChange({ ...draft, [key]: { ...draft[key], ...patch } });

  return (
    <div className="space-y-2">
      {WEEK_DAYS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <span className="w-[70px] shrink-0 text-xs font-semibold text-muted-foreground">{label}</span>
          {draft[key].closed ? (
            <span className="flex-1 text-xs text-muted-foreground italic">Closed all day</span>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="time"
                value={draft[key].open}
                onChange={e => setDay(key, { open: e.target.value })}
                className="h-9 w-[110px] text-xs"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="time"
                value={draft[key].close}
                onChange={e => setDay(key, { close: e.target.value })}
                className="h-9 w-[110px] text-xs"
              />
            </div>
          )}
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={draft[key].closed}
              onChange={e => setDay(key, { closed: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            Closed
          </label>
        </div>
      ))}
    </div>
  );
}

function AvailabilityPill({ openState, isManuallyClosed }: { openState?: OpenState; isManuallyClosed?: boolean }) {
  // A manual close always wins, exactly as the server evaluates it — so the pill is
  // right the instant the toggle is flipped, before the list has refetched.
  const manuallyClosed = isManuallyClosed === true;
  const isOpen = manuallyClosed ? false : openState ? openState.isOpen : true;
  const label = manuallyClosed ? "Closed" : openState?.label || "Open now";

  return (
    <div className="space-y-1">
      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
        isOpen
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}>
        {label}
      </span>
      <p className="text-[10px] text-muted-foreground">
        {isManuallyClosed ? "Closed by admin" : openState?.today || "No hours set"}
      </p>
    </div>
  );
}

export default function MeatCenters() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // View/Edit states for Meat Centers
  const [viewingCenter, setViewingCenter] = useState<MeatCenter | null>(null);
  const [editingCenter, setEditingCenter] = useState<MeatCenter | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    isManuallyClosed: false
  });

  // Kept beside editForm rather than inside it: a centre with no schedule must stay
  // "always open", so the week is only written when the admin explicitly turns it on.
  const [editHoursEnabled, setEditHoursEnabled] = useState(false);
  const [editHours, setEditHours] = useState<HoursDraft>(() => toHoursDraft());

  const deleteCenterMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/meat/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-centers"] });
      toast.success("Meat Center deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete meat center");
    }
  });

  const updateCenterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminFetch(`/meat/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-centers"] });
      toast.success("Meat Center updated successfully");
      setIsEditOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update meat center");
    }
  });

  const handleEditClick = (center: MeatCenter) => {
    setEditingCenter(center);
    setEditForm({
      name: center.name,
      phone: center.phone,
      address: center.address,
      isManuallyClosed: center.isManuallyClosed === true
    });
    setEditHoursEnabled(hasWeeklyHours(center.openingHours));
    setEditHours(toHoursDraft(center.openingHours));
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCenter) return;
    updateCenterMutation.mutate({
      id: editingCenter._id,
      // An empty object clears the schedule, which the server reads as "always open".
      data: { ...editForm, openingHours: editHoursEnabled ? toWeeklyHours(editHours) : {} }
    });
  };

  const handleDeleteClick = (center: MeatCenter) => {
    if (confirm(`Are you sure you want to delete ${center.name}?`)) {
      deleteCenterMutation.mutate(center._id);
    }
  };

  const handleViewClick = (center: MeatCenter) => {
    setViewingCenter(center);
    setIsViewOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const [newCenter, setNewCenter] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    categories: [] as string[],
    country: "India",
    state: "",
    city: ""
  });

  const { data: centers, isLoading } = useQuery({
    queryKey: ["meat-centers"],
    queryFn: () => adminFetch<MeatCenter[]>("/meat/nearby?lat=0&lng=0&all=true"),
  });

  // The View dialog holds a snapshot, so after an availability toggle refetches the list
  // it would keep rendering the openState it was opened with. Re-sync it from the fresh row.
  useEffect(() => {
    if (!isViewOpen) return;
    setViewingCenter((current) => {
      if (!current) return current;
      return (centers || []).find((c) => c._id === current._id) || current;
    });
  }, [centers, isViewOpen]);

  const createCenterMutation = useMutation({
    mutationFn: (data: any) => adminFetch("/meat", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-centers"] });
      toast.success("Meat Center added successfully");
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add meat center");
    }
  });

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const locationContext = `${newCenter.city}, ${newCenter.state}, ${newCenter.country}`
        .split(",")
        .map(s => s.trim())
        .filter(s => s !== "")
        .join(", ");

      // Query 1 — Text Search: finds shops by category keywords
      // e.g. "aa chicken mutton shop in Rajahmundry" → Madeena, Mubarak, AL KAREEM...
      const meatQuery = locationContext
        ? `${val} chicken mutton shop in ${locationContext}`
        : `${val} chicken mutton shop`;

      // Query 2 — Autocomplete + meat filter: finds shops by name PREFIX
      // IMPORTANT: pass ONLY the raw typed value — Google Autocomplete does
      // literal prefix matching on the input string. Appending " in City, State"
      // means it looks for a place literally named "aa in Rajahmundry..." which
      // will NEVER match "Aadab Mutton & Chicken Center".
      // Location bias is applied via the country component filter on the backend.
      const autoQuery = val;

      // Fire both in parallel for speed
      const [textResults, autoResults] = await Promise.all([
        adminFetch<any[]>(`/vendors/search-google?query=${encodeURIComponent(meatQuery)}&mode=textsearch`).catch(() => []),
        adminFetch<any[]>(`/vendors/search-google?query=${encodeURIComponent(autoQuery)}&mode=autocomplete-meat`).catch(() => []),
      ]);

      // Merge: Text Search first (authoritative), then Autocomplete extras
      // Deduplicate by place_id so the same shop doesn't appear twice
      const seen = new Set<string>();
      const merged = [...(textResults || []), ...(autoResults || [])].filter(r => {
        if (seen.has(r.place_id)) return false;
        seen.add(r.place_id);
        return true;
      });

      setSuggestions(merged);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }

  };

  const handleSelectSuggestion = async (suggestion: any) => {
    setSearchQuery(suggestion.description);
    setSuggestions([]);
    
    try {
      toast.loading("Fetching details...");
      const details = await adminFetch<any>(`/vendors/place-details/${suggestion.place_id}`);
      setSelectedPlace(details);
      setNewCenter(prev => ({ ...prev, name: details.name }));
      toast.dismiss();
    } catch (error) {
      toast.error("Failed to fetch details");
    }
  };

  const resetForm = () => {
    setNewCenter({ name: "", phone: "", email: "", password: "", categories: [], country: "India", state: "", city: "" });
    setSelectedPlace(null);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) {
      toast.error("Please search and select a center from the map");
      return;
    }
    if (!newCenter.phone.trim()) {
      toast.error("Contact phone is required");
      return;
    }
    if (!newCenter.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!newCenter.password.trim()) {
      toast.error("Password is required");
      return;
    }

    const payload = {
      ...newCenter,
      address: selectedPlace.formatted_address,
      location: {
        type: "Point",
        coordinates: [selectedPlace.geometry.location.lng, selectedPlace.geometry.location.lat]
      },
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800", // Default meat image
      rating: selectedPlace.rating || 0,
      reviews: selectedPlace.user_ratings_total?.toString() || "0",
    };

    createCenterMutation.mutate(payload);
  };

  return (
    <DashboardLayout searchPlaceholder="Search meat centers...">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header text-3xl font-bold">Meat Center Management</h1>
            <p className="page-subtitle text-muted-foreground">Manage your meat delivery partners.</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">Country</label>
                    <Input
                      value={newCenter.country}
                      onChange={e => setNewCenter({...newCenter, country: e.target.value})}
                      placeholder="India"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">State</label>
                    <Input
                      value={newCenter.state}
                      onChange={e => setNewCenter({...newCenter, state: e.target.value})}
                      placeholder="Telangana"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase text-muted-foreground">City</label>
                    <Input
                      value={newCenter.city}
                      onChange={e => setNewCenter({...newCenter, city: e.target.value})}
                      placeholder="Hyderabad"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search on Map</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search meat shop name..." 
                      className="pl-9"
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-[200px] overflow-auto">
                        {suggestions.map((s) => (
                          <button
                            key={s.place_id}
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
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
                  <Input
                    value={newCenter.phone}
                    onChange={e => setNewCenter({...newCenter, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (Login)</label>
                    <Input
                      type="email"
                      value={newCenter.email}
                      onChange={e => setNewCenter({...newCenter, email: e.target.value})}
                      placeholder="shop@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={newCenter.password}
                      onChange={e => setNewCenter({...newCenter, password: e.target.value})}
                      placeholder="Min. 8 characters"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createCenterMutation.isPending}>
                  {createCenterMutation.isPending ? "Adding..." : "Save Meat Center"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="section-card bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Center Name</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Address</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center">Loading...</td></tr>
              ) : centers?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No meat centers found.</td></tr>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                {centers?.map((center) => (
                  <motion.tr
                    key={center._id}
                    layout
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <Drumstick className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-sm font-medium">{center.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground max-w-[250px] truncate">{center.address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{center.rating}</span>
                        <span className="text-xs text-muted-foreground">({center.reviews})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AvailabilityPill openState={center.openState} isManuallyClosed={center.isManuallyClosed} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{center.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 hover:bg-muted rounded transition-colors">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClick(center)} className="gap-2 cursor-pointer">
                            <Eye className="h-4 w-4 text-muted-foreground" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(center)} className="gap-2 cursor-pointer">
                            <Edit2 className="h-4 w-4 text-muted-foreground" /> Edit Center
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(center)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 className="h-4 w-4" /> Delete Center
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Meat Center Details</DialogTitle>
          </DialogHeader>
          {viewingCenter && (
            <div className="space-y-4 py-4 text-sm">
              <div className="flex justify-between border-b pb-2 border-border">
                <span className="font-semibold text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{viewingCenter.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-border">
                <span className="font-semibold text-muted-foreground">Phone:</span>
                <span className="font-medium text-foreground">{viewingCenter.phone}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-border">
                <span className="font-semibold text-muted-foreground">Address:</span>
                <span className="font-medium text-foreground text-right max-w-[250px] break-words">{viewingCenter.address}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-border">
                <span className="font-semibold text-muted-foreground">Rating:</span>
                <span className="font-medium text-foreground">{viewingCenter.rating} ★ ({viewingCenter.reviews} reviews)</span>
              </div>

              {/* Open / Closed Control Section */}
              <div className="p-3 bg-muted rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <label className="font-bold text-foreground text-xs block">Order Availability</label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      A closed centre drops out of the app's "Open now" filter.
                    </p>
                  </div>
                  <AvailabilityPill openState={viewingCenter.openState} isManuallyClosed={viewingCenter.isManuallyClosed} />
                </div>
                <Button
                  size="sm"
                  variant={viewingCenter.isManuallyClosed ? "default" : "destructive"}
                  className="w-full rounded-lg"
                  disabled={updateCenterMutation.isPending}
                  onClick={() => {
                    const nextClosed = !viewingCenter.isManuallyClosed;
                    updateCenterMutation.mutate({
                      id: viewingCenter._id,
                      data: { isManuallyClosed: nextClosed }
                    });
                    setViewingCenter({ ...viewingCenter, isManuallyClosed: nextClosed });
                  }}
                >
                  {viewingCenter.isManuallyClosed ? "Reopen Meat Center" : "Close Meat Center Now"}
                </Button>
                {viewingCenter.openState?.week?.length ? (
                  <div className="space-y-0.5 pt-1 border-t border-border/60">
                    {viewingCenter.openState.week.map((day) => (
                      <div key={day.day} className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">{day.day}</span>
                        <span className="font-medium text-foreground">{day.hours}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                    No weekly hours set — open around the clock unless closed above.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Center Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[520px] rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Meat Center</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={editForm.phone}
                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={editForm.address}
                onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editCenterManuallyClosed"
                  checked={editForm.isManuallyClosed}
                  onChange={e => setEditForm({ ...editForm, isManuallyClosed: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="editCenterManuallyClosed" className="text-sm font-medium cursor-pointer select-none">
                  Temporarily closed (stop taking orders)
                </label>
              </div>

              <div className="flex items-center gap-2 border-t border-border pt-3">
                <input
                  type="checkbox"
                  id="editCenterHoursEnabled"
                  checked={editHoursEnabled}
                  onChange={e => setEditHoursEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="editCenterHoursEnabled" className="text-sm font-medium cursor-pointer select-none">
                  Set weekly opening hours
                </label>
              </div>

              {editHoursEnabled ? (
                <OpeningHoursEditor draft={editHours} onChange={setEditHours} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Without a schedule this centre is treated as open around the clock.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full mt-4" disabled={updateCenterMutation.isPending}>
              {updateCenterMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
