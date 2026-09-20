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

export default function RestaurantMenu() {
  const {
  id, name, image, rating, reviews, isMeat, insets, tabBarHeight, tokens, accent, styles, items,
  toggleFavorite, isFavorite, toggleFavoriteItem, isDishFavorite, loading, activeCategory,
  scrolledPast, setScrolledPast, searchQuery, setSearchQuery, vegOnly, setVegOnly,
  highlightedItemId, selectedDishDetail, setSelectedDishDetail, scrollViewRef, loadingItems,
  handleAddToCart, handleUpdateQuantity, categoryPositions, handleScroll, handleCategoryPress,
  groupedMenu, categoryTabs, metaLine1Parts, metaLine2Parts
  } = useRestaurantMenu();

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
