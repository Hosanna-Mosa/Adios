import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BASE_URL } from "@/lib/api-client";
import type { MenuItem, Restaurant } from "../restaurantMenuTypes";

const ITEMS_PER_PAGE = 10;

// Every request on this page authenticates the same way: whichever of the
// two tokens is present (this page is reachable by both admin and vendor
// roles). Moved out of each individual fetch call into one place.
const authHeader = () => `Bearer ${localStorage.getItem("admin_token") || localStorage.getItem("vendor_token")}`;

/**
 * The restaurant list/search/pagination/delete/view/QR state for
 * RestaurantMenu.tsx (work queue item #3). The 3-step add wizard and the
 * edit-restaurant flow live in their own hooks instead, per "do not create
 * one giant unmaintainable hook" -- this hook also owns `fetchMenu` since
 * both of those flows call it too (View and Edit both load a restaurant's
 * current menu the same way).
 */
export function useRestaurantMenuList() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedQrRestaurant, setSelectedQrRestaurant] = useState<Restaurant | null>(null);
  const [viewMenu, setViewMenu] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  const { data: restaurants = [], isLoading } = useQuery<Restaurant[]>({
    queryKey: ["restaurants-menu"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/food/restaurant-menu/restaurants`, {
        headers: { Authorization: authHeader() },
      });
      if (!response.ok) throw new Error("Failed to fetch restaurants");
      return response.json();
    },
  });

  // Fetch a single restaurant's menu, for both the View dialog and the Edit
  // dialog (each keeps its own copy: viewMenu is read-only display, editMenu
  // -- in useRestaurantEditFlow -- is the editable working copy).
  const fetchMenu = async (restaurantId: string): Promise<MenuItem[] | null> => {
    setIsLoadingMenu(true);
    try {
      const response = await fetch(`${BASE_URL}/food/restaurant-menu/restaurants/${restaurantId}`, {
        headers: { Authorization: authHeader() },
      });
      if (!response.ok) throw new Error("Failed to fetch menu");
      const data = await response.json();
      setViewMenu(data.menu);
      return data.menu as MenuItem[];
    } catch (err) {
      toast.error((err as Error).message || "Failed to load restaurant menu");
      return null;
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${BASE_URL}/food/restaurant-menu/restaurants/${id}`, {
        method: "DELETE",
        headers: { Authorization: authHeader() },
      });
      if (!response.ok) throw new Error("Failed to delete restaurant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants-menu"] });
      toast.success("Restaurant deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Delete failed");
    },
  });

  const handleDelete = (restaurant: Restaurant) => {
    if (confirm(`Are you sure you want to delete ${restaurant.name} and all its menu items?`)) {
      deleteMutation.mutate(restaurant._id);
    }
  };

  const handleViewClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    fetchMenu(restaurant._id);
    setIsViewOpen(true);
  };

  const handleQrClick = (restaurant: Restaurant) => {
    setSelectedQrRestaurant(restaurant);
    setIsQrOpen(true);
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById("restaurant-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40; // Add padding
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${selectedQrRestaurant?.name.replace(/\s+/g, "_")}_QR_Menu.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRestaurants.length / ITEMS_PER_PAGE);
  const paginatedRestaurants = filteredRestaurants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return {
    restaurants,
    isLoading,
    searchQuery,
    setSearchQuery: handleSearchChange,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    filteredRestaurants,
    totalPages,
    paginatedRestaurants,
    fetchMenu,
    handleDelete,
    isViewOpen,
    setIsViewOpen,
    isQrOpen,
    setIsQrOpen,
    selectedRestaurant,
    setSelectedRestaurant,
    selectedQrRestaurant,
    viewMenu,
    isLoadingMenu,
    handleViewClick,
    handleQrClick,
    handleDownloadQr,
  };
}

export { authHeader };
