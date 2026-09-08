import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { MenuBody } from "@/features/food/components/MenuBody";
import { DishDetailSheet } from "@/features/food/components/DishDetailSheet";
import { View, ScrollView } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";
import Constants from "expo-constants";
import { createStyles } from "@/features/food/restaurant-menu.styles";
import { CategoryTabs } from "@/features/food/components/CategoryTabs";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { useCartStore } from "@/contexts/cartStore";
import { useAuthStore } from "@/contexts/authStore";
import { AppTabBar, useAppTabBarHeight } from "@/components/AppTabBar";
import { shareRestaurant } from "@/utils/shareLink";
import { RestaurantMenuSolidHeader } from "@/features/food/components/RestaurantMenuSolidHeader";
import { RestaurantMenuHeroOverlay } from "@/features/food/components/RestaurantMenuHeroOverlay";

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  images: string[];
  isAvailable?: boolean;
}

export default function RestaurantMenu() {
  const {
    id, name, image, rating, reviews, isMeat, highlightDishId,
    categories, minOrderValue, time, distance, address,
  } = useLocalSearchParams();

  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services[isMeat === "true" ? "meat" : "food"];
  const styles = useMemo(() => createStyles(tokens, accent), [theme, isMeat]);

  const { setVendorId } = useDeliveryStore();
  const { items, requestAddItem, updateQuantity, getItemCount } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);
  const isFavorite = useMemo(() => user?.favorites?.includes(id as string) || false, [user?.favorites, id]);
  const toggleFavoriteItem = useAuthStore((s) => s.toggleFavoriteItem);
  const isDishFavorite = useCallback(
    (dishId: string) => user?.favoriteItems?.includes(dishId) || false,
    [user?.favoriteItems]
  );

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [scrolledPast, setScrolledPast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState("");
  const [selectedDishDetail, setSelectedDishDetail] = useState<FoodItem | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  const handleAddToCart = (item: FoodItem) => {
    if (loadingItems[item._id] || item.isAvailable === false) return;
    setLoadingItems((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      requestAddItem(item as any, id as string, name as string);
      setLoadingItems((prev) => ({ ...prev, [item._id]: false }));
    }, 450);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (loadingItems[itemId]) return;
    setLoadingItems((prev) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      updateQuantity(itemId, newQty);
      setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
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

  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
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
    return filteredMenu.reduce((acc, item) => {
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

  return (
    <View style={styles.container}>
      {/* Overlay header — icons over the hero until scrolled, solid bar after */}
      {!scrolledPast ? (
        <RestaurantMenuHeroOverlay
          accent={accent}
          id={id}
          insets={insets}
          isFavorite={isFavorite}
          name={name}
          setScrolledPast={setScrolledPast}
          styles={styles}
          toggleFavorite={toggleFavorite}
        />
      ) : (
        <RestaurantMenuSolidHeader
          accent={accent}
          id={id}
          insets={insets}
          isFavorite={isFavorite}
          name={name}
          styles={styles}
          toggleFavorite={toggleFavorite}
          tokens={tokens}
        />
      )}

      {scrolledPast && categoryTabs.length > 0 && (
        <View style={[styles.fixedTabsBar, { top: insets.top + moderateScale(52) }]}>
          <CategoryTabs categoryTabs={categoryTabs} activeCategory={activeCategory} onPress={handleCategoryPress} styles={styles} />
        </View>
      )}

      <MenuBody
        CategoryTabs={CategoryTabs}
        accent={accent}
        activeCategory={activeCategory}
        categoryPositions={categoryPositions}
        categoryTabs={categoryTabs}
        groupedMenu={groupedMenu}
        handleAddToCart={handleAddToCart}
        handleCategoryPress={handleCategoryPress}
        handleScroll={handleScroll}
        handleUpdateQuantity={handleUpdateQuantity}
        highlightedItemId={highlightedItemId}
        id={id}
        image={image}
        isMeat={isMeat}
        items={items}
        loading={loading}
        loadingItems={loadingItems}
        metaLine1Parts={metaLine1Parts}
        metaLine2Parts={metaLine2Parts}
        name={name}
        rating={rating}
        reviews={reviews}
        scrollViewRef={scrollViewRef}
        scrolledPast={scrolledPast}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setSelectedDishDetail={setSelectedDishDetail}
        setVegOnly={setVegOnly}
        styles={styles}
        tabBarHeight={tabBarHeight}
        tokens={tokens}
        vegOnly={vegOnly}
      />

      {/* Dish detail modal */}
      <DishDetailSheet
        shareRestaurant={shareRestaurant}
        accent={accent}
        handleAddToCart={handleAddToCart}
        handleUpdateQuantity={handleUpdateQuantity}
        id={id}
        insets={insets}
        isDishFavorite={isDishFavorite}
        items={items}
        name={name}
        selectedDishDetail={selectedDishDetail}
        setSelectedDishDetail={setSelectedDishDetail}
        styles={styles}
        toggleFavoriteItem={toggleFavoriteItem}
        tokens={tokens}
      />

      <AppTabBar accent={isMeat === "true" ? "meat" : "food"} cartVendorName={name as string} />
    </View>
  );
}

