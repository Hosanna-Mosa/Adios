import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { DietMarker } from "./DietMarker";

// Moved out of app/149-store.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  buildFoodItem: any;
  accent: any;
  activeCategory: any;
  addCartItem: any;
  areaLabel: any;
  areaLine: any;
  cartItems: any[];
  categories: any[];
  lat: any;
  lng: any;
  loading: any;
  setActiveCategory: any;
  setIsSheetVisible: any;
  setSelectedItem: any;
  store149Items: any;
  styles: any;
  tokens: any;
  updateCartQuantity: any;
  visibleItems: any[];
}

export function Store149Sheet({
  buildFoodItem,
  accent,
  activeCategory,
  addCartItem,
  areaLabel,
  areaLine,
  cartItems,
  categories,
  lat,
  lng,
  loading,
  setActiveCategory,
  setIsSheetVisible,
  setSelectedItem,
  store149Items,
  styles,
  tokens,
  updateCartQuantity,
  visibleItems,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.sheet}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
        {categories.map((cat, idx) => (
          <Animated.View key={cat} entering={staggerListItem(idx)}>
            <TouchableOpacity
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryChipText, activeCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ paddingVertical: 60, alignItems: "center" }}>
          <ActivityIndicator size="large" color={accent.accent} />
        </View>
      ) : lat == null || lng == null ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>{t("app.food.setADeliveryAddress")}</Text>
          <Text style={styles.emptyStateText}>{t("app.food.wePickThe149MealsFrom")}</Text>
          <TouchableOpacity style={styles.emptyStateBtn} onPress={() => router.push("/delivery/saved-addresses")}>
            <Text style={styles.emptyStateBtnText}>{t("app.food.chooseAnAddress")}</Text>
          </TouchableOpacity>
        </View>
      ) : store149Items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>{t("app.food.nothingAt149Near")} {areaLabel}</Text>
          <Text style={styles.emptyStateText}>{t("app.food.noOutletAround")} {areaLine} {t("app.food.isRunningThe149MenuRight")}</Text>
          <TouchableOpacity style={styles.emptyStateBtn} onPress={() => router.push("/delivery/saved-addresses")}>
            <Text style={styles.emptyStateBtnText}>{t("app.food.changeAddress")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.grid}>
          {visibleItems.map((item, idx) => {
            const cartItem = cartItems.find((i) => i._id === item._id);
            const handleAdd = () => addCartItem(buildFoodItem(item), item.vendorId, item.brand);

            return (
              <Animated.View key={item._id} entering={staggerListItem(idx)} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => { setSelectedItem(item); setIsSheetVisible(true); }}
              >
                <View style={styles.cardImageWrap}>
                  <Image
                    source={{ uri: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" }}
                    style={styles.cardImage}
                  />
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.cardMetaRow}>
                    <DietMarker isVeg={!!item.isVeg} color={item.isVeg ? tokens.veg : tokens.nonveg} />
                    <Text style={styles.cardRating}>{item.rating || "4.2"} ★</Text>
                  </View>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cardBrand} numberOfLines={1}>
                    {item.brand || "Restaurant"}
                    {typeof item.distanceKm === "number" ? ` · ${item.distanceKm} km away` : ""}
                  </Text>
                  <View style={styles.cardPriceRow}>
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                      <Text style={styles.cardPrice}>₹{item.price}</Text>
                      {!!item.originalPrice && <Text style={styles.cardOriginalPrice}>₹{item.originalPrice}</Text>}
                    </View>
                    {cartItem ? (
                      <View style={styles.qtyPill}>
                        <TouchableOpacity onPress={() => updateCartQuantity(item._id, cartItem.quantity - 1)} style={styles.qtyBtn}>
                          <Feather name="minus" size={moderateScale(12)} color={accent.accent} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{cartItem.quantity}</Text>
                        <TouchableOpacity onPress={handleAdd} style={styles.qtyBtn}>
                          <Feather name="plus" size={moderateScale(12)} color={accent.accent} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                        <Feather name="plus" size={moderateScale(16)} color={accent.on} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
}
