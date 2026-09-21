import { useRef } from "react";

// Split out of useRestaurantMenu so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useRestaurantMenuHandleUpdateQuantity(updateQuantity: any, getItemCount: any, activeCategory: any, setActiveCategory: any, setScrolledPast: any, scrollViewRef: any, loadingItems: any, setLoadingItems: any) {
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (loadingItems[itemId]) return;
    setLoadingItems((prev: any) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      updateQuantity(itemId, newQty);
      setLoadingItems((prev: any) => ({ ...prev, [itemId]: false }));
    }, 450);
  };

  const itemCount = getItemCount();

  const categoryPositions = useRef<Record<string, number>>({});
  const isProgrammaticScroll = useRef(false);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    setScrolledPast(y > 170);

    if (!isProgrammaticScroll.current) {
      const sortedCats = Object.keys(categoryPositions.current).sort(
        (a, b) => categoryPositions.current[a] - categoryPositions.current[b]
      );
      let matchedCat = activeCategory;
      for (const cat of sortedCats) {
        if (y >= categoryPositions.current[cat] - 120) matchedCat = cat;
      }
      if (matchedCat && matchedCat !== activeCategory) setActiveCategory(matchedCat);
    }
  };

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    isProgrammaticScroll.current = true;
    const posY = categoryPositions.current[category];
    const targetY = posY !== undefined ? Math.max(0, posY - 10) : 0;
    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600);
  };

  return { handleUpdateQuantity, categoryPositions, handleScroll, handleCategoryPress };
}
