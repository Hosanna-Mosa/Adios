import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { NewVendorForm, PlaceDetails, PlaceSuggestion } from "../types";

const EMPTY_FORM: NewVendorForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  isPureVeg: false,
  country: "India",
  state: "",
  city: "",
};

/**
 * The "Add New Restaurant" dialog: search Google Places for the restaurant,
 * pick a suggestion, then fill in contact details. Split out from
 * useVendorsList per "do not create one giant unmanageable hook" -- fully
 * independent of the list/View-dialog concerns there.
 */
export function useVendorAddForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newVendor, setNewVendor] = useState<NewVendorForm>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const createVendorMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => adminFetch("/vendors", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success(t("catalog.vendorAddedSuccessfully"));
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || t("catalog.failedToAddVendor"));
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
      // Construction for Text Search works best with "Business Name in City, State"
      const locationContext = `${newVendor.city}, ${newVendor.state}, ${newVendor.country}`
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
        .join(", ");

      const fullQuery = locationContext ? `${val} in ${locationContext}` : val;

      const data = await adminFetch<PlaceSuggestion[]>(`/vendors/search-google?query=${encodeURIComponent(fullQuery)}&types=establishment`);
      setSuggestions(data || []);
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
      toast.loading(t("catalog.fetchingPlaceDetails"));
      const details = await adminFetch<PlaceDetails>(`/vendors/place-details/${suggestion.place_id}`);
      setSelectedPlace(details);
      setNewVendor((prev) => ({ ...prev, name: details.name }));
      toast.dismiss();
    } catch {
      toast.error(t("catalog.failedToFetchRestaurantDetails"));
    }
  };

  const resetForm = () => {
    setNewVendor(EMPTY_FORM);
    setSelectedPlace(null);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) {
      toast.error(t("catalog.pleaseSearchAndSelectRestaurant"));
      return;
    }

    if (!newVendor.password) {
      toast.error(t("catalog.pleaseSetPasswordForVendor"));
      return;
    }

    const payload = {
      ...newVendor,
      googlePlaceId: selectedPlace.place_id,
      address: selectedPlace.formatted_address,
      location: {
        type: "Point",
        coordinates: [selectedPlace.geometry.location.lng, selectedPlace.geometry.location.lat],
      },
      image: selectedPlace.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${selectedPlace.photos[0].photo_reference}&key=AIzaSyD23mZxzw78gBlz6EGEZ6BMgCwc4fygJMA`
        : "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500",
      rating: selectedPlace.rating || 0,
      reviews: selectedPlace.user_ratings_total?.toString() || "0",
    };

    createVendorMutation.mutate(payload);
  };

  return {
    isAddOpen,
    setIsAddOpen,
    newVendor,
    setNewVendor,
    searchQuery,
    selectedPlace,
    suggestions,
    isSearching,
    handleSearch,
    handleSelectSuggestion,
    handleSubmit,
    isSubmitting: createVendorMutation.isPending,
  };
}
