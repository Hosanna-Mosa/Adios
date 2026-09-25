import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { NewMeatCenterForm, PlaceDetails, PlaceSuggestion } from "../meatCenterTypes";

const EMPTY_FORM: NewMeatCenterForm = { name: "", phone: "", email: "", password: "", categories: [], country: "India", state: "", city: "" };

/**
 * The "Add New Meat Center" dialog: search Google (a two-query merge --
 * see handleSearch below), pick a suggestion, then fill in contact
 * details. Split out from useMeatCentersList per "do not create one giant
 * unmanageable hook", same shape as useVendorAddForm (item #4) but not
 * merged with it: the search queries, required fields (email+password
 * here vs. just password for vendors), and payload differ enough that
 * force-sharing one hook would need a pile of feature-specific branches.
 */
export function useMeatCenterAddForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCenter, setNewCenter] = useState<NewMeatCenterForm>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);

  const createCenterMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminFetch("/meat", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meat-centers"] });
      toast.success(t("catalog.meatCenterAddedSuccessfully"));
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || t("catalog.failedToAddMeatCenter"));
    },
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
        .map((s) => s.trim())
        .filter((s) => s !== "")
        .join(", ");

      // Query 1 — Text Search: finds shops by category keywords
      // e.g. "aa chicken mutton shop in Rajahmundry" → Madeena, Mubarak, AL KAREEM...
      const meatQuery = locationContext ? `${val} chicken mutton shop in ${locationContext}` : `${val} chicken mutton shop`;

      // Query 2 — Autocomplete + meat filter: finds shops by name PREFIX
      // IMPORTANT: pass ONLY the raw typed value — Google Autocomplete does
      // literal prefix matching on the input string. Appending " in City, State"
      // means it looks for a place literally named "aa in Rajahmundry..." which
      // will NEVER match "Aadab Mutton & Chicken Center".
      // Location bias is applied via the country component filter on the backend.
      const autoQuery = val;

      // Fire both in parallel for speed
      const [textResults, autoResults] = await Promise.all([
        adminFetch<PlaceSuggestion[]>(`/vendors/search-google?query=${encodeURIComponent(meatQuery)}&mode=textsearch`).catch(() => []),
        adminFetch<PlaceSuggestion[]>(`/vendors/search-google?query=${encodeURIComponent(autoQuery)}&mode=autocomplete-meat`).catch(() => []),
      ]);

      // Merge: Text Search first (authoritative), then Autocomplete extras
      // Deduplicate by place_id so the same shop doesn't appear twice
      const seen = new Set<string>();
      const merged = [...(textResults || []), ...(autoResults || [])].filter((r) => {
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

  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    setSearchQuery(suggestion.description);
    setSuggestions([]);

    try {
      toast.loading(t("catalog.fetchingDetailsEllipsis"));
      const details = await adminFetch<PlaceDetails>(`/vendors/place-details/${suggestion.place_id}`);
      setSelectedPlace(details);
      setNewCenter((prev) => ({ ...prev, name: details.name }));
      toast.dismiss();
    } catch {
      toast.error(t("catalog.failedToFetchDetails"));
    }
  };

  const resetForm = () => {
    setNewCenter(EMPTY_FORM);
    setSelectedPlace(null);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) {
      toast.error(t("catalog.pleaseSearchAndSelectCenterFromMap"));
      return;
    }
    if (!newCenter.phone.trim()) {
      toast.error(t("catalog.contactPhoneRequired"));
      return;
    }
    if (!newCenter.email.trim()) {
      toast.error(t("catalog.emailRequired"));
      return;
    }
    if (!newCenter.password.trim()) {
      toast.error(t("catalog.passwordRequired"));
      return;
    }

    const payload = {
      ...newCenter,
      address: selectedPlace.formatted_address,
      location: {
        type: "Point",
        coordinates: [selectedPlace.geometry.location.lng, selectedPlace.geometry.location.lat],
      },
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800", // Default meat image
      rating: selectedPlace.rating || 0,
      reviews: selectedPlace.user_ratings_total?.toString() || "0",
    };

    createCenterMutation.mutate(payload);
  };

  return {
    isAddOpen,
    setIsAddOpen,
    newCenter,
    setNewCenter,
    searchQuery,
    suggestions,
    isSearching,
    selectedPlace,
    handleSearch,
    handleSelectSuggestion,
    handleSubmit,
    isSubmitting: createCenterMutation.isPending,
  };
}
