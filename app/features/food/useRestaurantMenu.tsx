import { useRestaurantMenuId } from "./useRestaurantMenuId";
import { useRestaurantMenuHandleUpdateQuantity } from "./useRestaurantMenuHandleUpdateQuantity";
import { useRestaurantMenuLoader } from "./useRestaurantMenuLoader";
import { useRestaurantMenuFilteredMenu } from "./useRestaurantMenuFilteredMenu";

// State, data loading and handlers for app/restaurant-menu.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useRestaurantMenu() {
  const { id, name, image, rating, reviews, isMeat, highlightDishId, categories, minOrderValue, time, distance, address, insets, tabBarHeight, tokens, accent, styles, setVendorId, items, updateQuantity, getItemCount, toggleFavorite, isFavorite, toggleFavoriteItem, isDishFavorite, loading, setLoading, menu, setMenu, activeCategory, setActiveCategory, scrolledPast, setScrolledPast, searchQuery, setSearchQuery, vegOnly, setVegOnly, highlightedItemId, setHighlightedItemId, selectedDishDetail, setSelectedDishDetail, scrollViewRef, searchInputRef, loadingItems, setLoadingItems, handleAddToCart, orderingState, outletClosed } = useRestaurantMenuId();
  const { handleUpdateQuantity, categoryPositions, handleScroll, handleCategoryPress } = useRestaurantMenuHandleUpdateQuantity(updateQuantity, getItemCount, activeCategory, setActiveCategory, setScrolledPast, scrollViewRef, loadingItems, setLoadingItems);
  const {  } = useRestaurantMenuLoader(id, isMeat, highlightDishId, setVendorId, setLoading, menu, setMenu, setActiveCategory, setHighlightedItemId, handleCategoryPress);
  const { groupedMenu, categoryTabs, metaLine1Parts, metaLine2Parts } = useRestaurantMenuFilteredMenu(isMeat, categories, minOrderValue, time, distance, address, menu, activeCategory, setActiveCategory, searchQuery, vegOnly);

  // The hero header's search icon used to just flip the header style with no
  // actual search effect. It now scrolls to the search box (just below the
  // hero image, at the top of the list) and focuses it once the scroll settles.
  const handleSearchIconPress = () => {
    setScrolledPast(true);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => searchInputRef.current?.focus(), 300);
  };

  return {
  id, name, image, rating, reviews, isMeat, insets, tabBarHeight, tokens, accent, styles, items,
  toggleFavorite, isFavorite, toggleFavoriteItem, isDishFavorite, loading, activeCategory,
  scrolledPast, setScrolledPast, searchQuery, setSearchQuery, vegOnly, setVegOnly,
  highlightedItemId, selectedDishDetail, setSelectedDishDetail, scrollViewRef, searchInputRef, loadingItems,
  handleAddToCart, handleUpdateQuantity, categoryPositions, handleScroll, handleCategoryPress,
  groupedMenu, categoryTabs, metaLine1Parts, metaLine2Parts, orderingState, outletClosed, handleSearchIconPress
  };
}

