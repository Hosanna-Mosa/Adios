import { useEffect } from "react";
import Constants from "expo-constants";

// Split out of useRestaurantMenu so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRestaurantMenuLoader(id: any, isMeat: any, highlightDishId: any, setVendorId: any, setLoading: any, menu: any, setMenu: any, setActiveCategory: any, setHighlightedItemId: any, handleCategoryPress: any) {
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
              images: item.images || (item.image ? [item.image] : []),
              description: item.description || (item.weight ? String(item.weight) : ""),
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
