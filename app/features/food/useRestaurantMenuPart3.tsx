import { useEffect } from "react";
import Constants from "expo-constants";

// Part 3 of useRestaurantMenu, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useRestaurantMenuPart3(id: any, isMeat: any, highlightDishId: any, setVendorId: any, setLoading: any, menu: any, setMenu: any, setActiveCategory: any, setHighlightedItemId: any, handleCategoryPress: any) {
  useEffect(() => {
    if (id) setVendorId(id as string);
  }, [id]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;
        const endpoint = isMeat === "true"
          ? `${baseUrl}/meat/menu/${id}`
          : `${baseUrl}/food/vendor/${id}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        const normalizedData = data.map((item: any) => {
          if (isMeat === "true") {
            return {
              ...item,
              isVeg: false,
              images: item.images || [item.image || "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400"],
              description: item.description || `Fresh ${item.name} - ${item.weight}`,
            };
          }
          return item;
        });

        setMenu(normalizedData);
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
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [id, isMeat]);

  return {  };
}
