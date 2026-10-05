import { customFetch } from "@/utils/api/custom-fetch";
import type { FoodItem, FoodItemInput, MeatItem } from "@/types/models";

// Restaurant menu (food) and meat inventory — the calls
// admin/src/features/vendors/hooks/useVendorMenu.ts and useVendorMeatMenu.ts make.

// --- Restaurant menu --------------------------------------------------------

export const getFoodMenu = (vendorId: string) => customFetch<FoodItem[]>(`/food/vendor/${vendorId}`);

const toPayload = (input: FoodItemInput) => ({
  name: input.name.trim(),
  description: input.description.trim(),
  price: input.price,
  category: input.category.trim(),
  isVeg: input.isVeg,
  images: input.images,
});

export const addFoodItem = (vendorId: string, input: FoodItemInput) =>
  customFetch<FoodItem>("/food", { method: "POST", body: JSON.stringify({ ...toPayload(input), vendorId }) });

// Never carries isAvailable — that flag has its own endpoint so an edit can't clobber it.
export const updateFoodItem = (id: string, input: FoodItemInput) =>
  customFetch<FoodItem>(`/food/${id}`, { method: "PUT", body: JSON.stringify(toPayload(input)) });

export const deleteFoodItem = (id: string) => customFetch(`/food/${id}`, { method: "DELETE" });

export const setFoodItemAvailability = (id: string, isAvailable: boolean) =>
  customFetch<FoodItem>(`/food/items/${id}/availability`, { method: "PATCH", body: JSON.stringify({ isAvailable }) });

export interface LocalImage {
  uri: string;
  name: string;
  type: string;
}

/** Uploads picked photos to Cloudinary through the backend; returns their URLs. */
export async function uploadFoodImages(images: LocalImage[]): Promise<string[]> {
  const form = new FormData();
  // React Native's FormData takes { uri, name, type } file descriptors.
  images.forEach((image) => form.append("images", image as unknown as Blob));
  const data = await customFetch<{ imageUrls?: string[] }>("/food/upload", {
    method: "POST",
    body: form,
    isFormData: true,
  });
  return data?.imageUrls ?? [];
}

// --- Meat inventory ---------------------------------------------------------

/** Every item, in stock or not — the customer-facing menu only lists available ones. */
export const getMeatInventory = (centerId: string) => customFetch<MeatItem[]>(`/meat/vendor-menu/${centerId}`);

export const setMeatItemAvailability = (itemId: string, isAvailable: boolean) =>
  customFetch(`/meat/items/${itemId}/availability`, { method: "PUT", body: JSON.stringify({ isAvailable }) });

export const setMeatItemPrice = (itemId: string, price: number) =>
  customFetch(`/meat/items/${itemId}/price`, { method: "PUT", body: JSON.stringify({ price }) });
