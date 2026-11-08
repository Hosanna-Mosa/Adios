import { useEffect, useState } from "react";
import Constants from "expo-constants";

// Split out of useRestaurantMenu so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRestaurantMenuLoader(id: any, isMeat: any, highlightDishId: any, setVendorId: any, setLoading: any, menu: any, setMenu: any, setActiveCategory: any, setHighlightedItemId: any, handleCategoryPress: any) {
  useEffect(() => {
    if (id) setVendorId(id as string);
  }, [id]);

  // The request failed, as opposed to the outlet having no menu.
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
        const endpoint = isMeat === "true"
          ? `${baseUrl}/meat/menu/${id}`
          : `${baseUrl}/food/vendor/${id}`;

        const response = await fetch(endpoint);
        const data = await response.json();
        // An error body is an object, not a menu — it used to blow up on .map and
        // leave "Menu not available yet" up for what was really a failed request.
        if (!response.ok || !Array.isArray(data)) throw new Error(`Menu request failed (${response.status})`);

        const normalizedData = data.map((item: any) => {
          if (isMeat === "true") {
            return {
              ...item,
              isVeg: false,
              images: item.images || (item.image ? [item.image] : []),
              description: item.description || (item.weight ? String(item.weight) : ""),
            };
          }
          return item;
        });

        setMenu(normalizedData);
        setLoadError(false);
        if (normalizedData.length > 0) {
          let categoryToSelect = normalizedData[0].category;
          if (highlightDishId) {
            const targetItem = normalizedData.find((item: any) => item._id === highlightDishId);
            if (targetItem) {
              categoryToSelect = targetItem.category;
              setHighlightedItemId(highlightDishId as string);
              setTimeout(() => setHighlightedItemId(""), 2500);
              setTimeout(() => handleCategoryPress(categoryToSelect), 600);
            }
          }
          setActiveCategory(categoryToSelect);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id, isMeat, reloadKey]);

  return { loadError, retryMenu: () => setReloadKey((k) => k + 1) };
}
