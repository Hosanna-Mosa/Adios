import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type RestaurantMenuStyles } from "../restaurant-menu.styles";
import { DishImageCarousel } from "./DishImageCarousel";

// Moved out of app/restaurant-menu.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  shareRestaurant: any;
  accent: ServiceTokens;
  handleAddToCart: any;
  handleUpdateQuantity: any;
  id: string | string[];
  insets: EdgeInsets;
  isDishFavorite: any;
  items: any[];
  name: string | string[];
  /** The outlet isn't taking orders — no adding, though quantities can still go down. */
  outletClosed: boolean;
  selectedDishDetail: any;
  setSelectedDishDetail: React.Dispatch<React.SetStateAction<any>>;
  styles: RestaurantMenuStyles;
  toggleFavoriteItem: any;
  tokens: ThemeTokens;
}

export function DishDetailSheet({
  shareRestaurant,
  accent,
  handleAddToCart,
  handleUpdateQuantity,
  id,
  insets,
  isDishFavorite,
  items,
  name,
  outletClosed,
  selectedDishDetail,
  setSelectedDishDetail,
  styles,
  toggleFavoriteItem,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={!!selectedDishDetail} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.modalBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setSelectedDishDetail(null)} />
        {selectedDishDetail && (
          <View style={styles.modalSheet}>
            {/* Keyed by dish, so each dish opens on its first photo. */}
            <DishImageCarousel
              key={selectedDishDetail._id}
              images={selectedDishDetail.images}
              imageStyle={styles.modalImage}
              activeColor={accent.accent}
            />
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setSelectedDishDetail(null)}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCloseBtn, { right: undefined, left: 16 }]}
              onPress={() => shareRestaurant(id as string, name as string, selectedDishDetail._id, selectedDishDetail.name)}
            >
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.modalHeadRow}>
                <View style={[styles.dietIcon, { borderColor: selectedDishDetail.isVeg ? tokens.veg : tokens.nonveg }]}>
                  {selectedDishDetail.isVeg ? (
                    <View style={[styles.vegDotSmall, { backgroundColor: tokens.veg }]} />
                  ) : (
                    <View style={styles.nonvegTriangle} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{selectedDishDetail.name}</Text>
                  <Text style={styles.modalPrice}>₹{selectedDishDetail.price}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalFavoriteBtn}
                  onPress={() => toggleFavoriteItem(selectedDishDetail._id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isDishFavorite(selectedDishDetail._id) ? "heart" : "heart-outline"}
                    size={moderateScale(20)}
                    color={isDishFavorite(selectedDishDetail._id) ? accent.accent : tokens.sec}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalDesc}>{selectedDishDetail.description}</Text>

              {selectedDishDetail.isAvailable === false ? (
                <View style={styles.modalSoldOut}><Text style={styles.soldOutText}>{t("app.food.currentlySoldOut")}</Text></View>
              ) : outletClosed && !items.find((i) => i._id === selectedDishDetail._id) ? (
                <View style={styles.modalSoldOut}><Text style={styles.soldOutText}>{t("app.food.notAcceptingOrdersNow")}</Text></View>
              ) : items.find((i) => i._id === selectedDishDetail._id) ? (
                <View style={styles.modalQtyRow}>
                  <TouchableOpacity
                    style={styles.modalQtyBtn}
                    onPress={() => handleUpdateQuantity(selectedDishDetail._id, (items.find((i) => i._id === selectedDishDetail._id)?.quantity || 1) - 1)}
                  >
                    <Feather name="minus" size={16} color={accent.accent} />
                  </TouchableOpacity>
                  <Text style={styles.modalQtyText}>{items.find((i) => i._id === selectedDishDetail._id)?.quantity}</Text>
                  <TouchableOpacity style={[styles.modalQtyBtn, outletClosed && { opacity: 0.35 }]} onPress={() => handleAddToCart(selectedDishDetail)}>
                    <Feather name="plus" size={16} color={accent.accent} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.modalAddBtn} activeOpacity={0.85} onPress={() => handleAddToCart(selectedDishDetail)}>
                  <Text style={styles.modalAddBtnText}>{t("app.food.addToCart")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
