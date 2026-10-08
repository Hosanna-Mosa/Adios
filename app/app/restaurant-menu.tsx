import { MenuBody } from "@/features/food/components/MenuBody";
import { DishDetailSheet } from "@/features/food/components/DishDetailSheet";
import { View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { CategoryTabs } from "@/features/food/components/CategoryTabs";
import { AppTabBar } from "@/components/AppTabBar";
import { shareRestaurant } from "@/utils/shareLink";
import { RestaurantMenuSolidHeader } from "@/features/food/components/RestaurantMenuSolidHeader";
import { RestaurantMenuHeroOverlay } from "@/features/food/components/RestaurantMenuHeroOverlay";
import { useRestaurantMenu } from "@/features/food/useRestaurantMenu";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { selectNoRidersOnline, useHomeStore } from "@/contexts/homeStore";
import { showAlert } from "@/components/ui/AppAlert";

export default function RestaurantMenu() {
  const {
  id, name, image, rating, reviews, isMeat, insets, tabBarHeight, tokens, accent, styles, items,
  toggleFavorite, isFavorite, toggleFavoriteItem, isDishFavorite, loading, activeCategory,
  scrolledPast, setScrolledPast, searchQuery, setSearchQuery, vegOnly, setVegOnly,
  highlightedItemId, selectedDishDetail, setSelectedDishDetail, scrollViewRef, loadingItems,
  handleAddToCart, handleUpdateQuantity, categoryPositions, handleScroll, handleCategoryPress,
  groupedMenu, categoryTabs, metaLine1Parts, metaLine2Parts, orderingState, outletClosed
  } = useRestaurantMenu();
  const { t } = useTranslation();
  const noRidersOnline = useHomeStore(selectNoRidersOnline);
  // The pinned category strip hangs directly off the solid header. A fixed guess
  // at its height left a sliver of menu showing between the two.
  const [solidHeaderHeight, setSolidHeaderHeight] = useState(0);

  // Backstop for every entry point (cart, search, links): with no rider
  // online nothing here can be delivered, so return to Home.
  useEffect(() => {
    if (!noRidersOnline) return;
    showAlert(t("app.home.noRidersAvailableNearby"), t("app.home.allCaptainsNearbyAreOnTrips"));
    router.replace("/(tabs)");
  }, [noRidersOnline, t]);

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
          onHeight={setSolidHeaderHeight}
        />
      )}

      {scrolledPast && categoryTabs.length > 0 && (
        <View style={[styles.fixedTabsBar, { top: solidHeaderHeight || insets.top + moderateScale(52) }]}>
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
        orderingState={orderingState}
        outletClosed={outletClosed}
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
        outletClosed={outletClosed}
        selectedDishDetail={selectedDishDetail}
        setSelectedDishDetail={setSelectedDishDetail}
        styles={styles}
        toggleFavoriteItem={toggleFavoriteItem}
        tokens={tokens}
      />

      {/* No tab pill on a restaurant's menu — only the cart stripe, on the bottom edge. */}
      <AppTabBar accent={isMeat === "true" ? "meat" : "food"} cartVendorName={name as string} hideTabs />
    </View>
  );
}
