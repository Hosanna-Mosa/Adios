import { BASE_URL } from "@/lib/api-client";
import { authHeader } from "./useRestaurantMenuList";

/**
 * Uploads one menu-item photo and returns its URL. Shared by both
 * useRestaurantAddFlow (extractedMenu) and useRestaurantEditFlow (editMenu)
 * -- the original page had this exact fetch call inlined once, called with
 * a boolean flag choosing which state array to update. Splitting into two
 * hooks meant that flag no longer makes sense, so the network call is
 * pulled out here and each hook applies the result to its own array.
 */
export async function uploadMenuItemImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("images", file);

  const response = await fetch(`${BASE_URL}/food/upload`, {
    method: "POST",
    headers: { Authorization: authHeader() },
    body: formData,
  });

  if (!response.ok) throw new Error("Failed to upload image");

  const data = await response.json();
  return data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls[0] : null;
}
