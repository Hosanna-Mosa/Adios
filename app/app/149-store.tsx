import { ScrollView } from "react-native";
import { AppTabBar } from "@/components/AppTabBar";
import { Store149Sheet } from "@/features/food/components/Store149Sheet";
import { Store149HeroHeader } from "@/features/food/components/Store149HeroHeader";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { Store149ItemSheet } from "@/features/food/components/Store149ItemSheet";
import { useStore149 } from "@/features/food/useStore149";

export default function Store149Screen() {
  const {
  insets, tabBarHeight, cartItems, addCartItem, updateCartQuantity, store149Items, loading,
  selectedItem, setSelectedItem, isSheetVisible, setIsSheetVisible, activeCategory,
  setActiveCategory, tokens, accent, styles, lat, lng, outletCount, areaLabel, areaLine,
  farthestKm, categories, visibleItems
  } = useStore149();

  return (
    <ScreenShell>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}>
        {/* Full-bleed accent header — the one screen that floods the accent
            color, so the ₹149 promo gets its own identity before the
            neutral system resumes below. */}
        <Store149HeroHeader
          accent={accent}
          areaLabel={areaLabel}
          areaLine={areaLine}
          farthestKm={farthestKm}
          insets={insets}
          outletCount={outletCount}
          store149Items={store149Items}
          styles={styles}
        />

        <Store149Sheet
          buildFoodItem={buildFoodItem}
          accent={accent}
          activeCategory={activeCategory}
          addCartItem={addCartItem}
          areaLabel={areaLabel}
          areaLine={areaLine}
          cartItems={cartItems}
          categories={categories}
          lat={lat}
          lng={lng}
          loading={loading}
          setActiveCategory={setActiveCategory}
          setIsSheetVisible={setIsSheetVisible}
          setSelectedItem={setSelectedItem}
          store149Items={store149Items}
          styles={styles}
          tokens={tokens}
          updateCartQuantity={updateCartQuantity}
          visibleItems={visibleItems}
        />
      </ScrollView>

      <AppTabBar accent="food" />

      {/* Item detail sheet */}
      <Store149ItemSheet
        buildFoodItem={buildFoodItem}
        accent={accent}
        addCartItem={addCartItem}
        cartItems={cartItems}
        insets={insets}
        isSheetVisible={isSheetVisible}
        selectedItem={selectedItem}
        setIsSheetVisible={setIsSheetVisible}
        styles={styles}
        tokens={tokens}
        updateCartQuantity={updateCartQuantity}
      />
    </ScreenShell>
  );
}

function buildFoodItem(item: any) {
  return {
    _id: item._id,
    name: item.name,
    description: item.description || "",
    price: item.price,
    category: item.category || "149 Store",
    isVeg: item.isVeg,
    images: item.images && item.images.length > 0 ? item.images : [],
  };
}
