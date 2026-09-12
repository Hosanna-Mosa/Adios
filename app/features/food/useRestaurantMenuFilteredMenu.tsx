import { useEffect, useMemo } from "react";
import { FoodItem } from "./useRestaurantMenu.shared";

// Split out of useRestaurantMenu so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRestaurantMenuFilteredMenu(isMeat: any, categories: any, minOrderValue: any, time: any, distance: any, address: any, menu: any, activeCategory: any, setActiveCategory: any, searchQuery: any, vegOnly: any) {
  const filteredMenu = useMemo(() => {
    return menu.filter((item: any) => {
      if (vegOnly && !item.isVeg) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [menu, searchQuery, vegOnly]);

  const groupedMenu = useMemo(() => {
    return filteredMenu.reduce((acc: any, item: any) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, FoodItem[]>);
  }, [filteredMenu]);

  const categoryTabs = Object.keys(groupedMenu);

  useEffect(() => {
    if ((searchQuery || vegOnly) && categoryTabs.length > 0 && !categoryTabs.includes(activeCategory)) {
      setActiveCategory(categoryTabs[0]);
    }
  }, [searchQuery, vegOnly, categoryTabs]);

  const metaLine1Parts = [
    categories,
    minOrderValue ? (isMeat === "true" ? `from ₹${minOrderValue} / kg` : `₹${minOrderValue} for two`) : "",
  ].filter(Boolean);
  const metaLine2Parts = [time, distance, address].filter(Boolean);

  return { groupedMenu, categoryTabs, metaLine1Parts, metaLine2Parts };
}
