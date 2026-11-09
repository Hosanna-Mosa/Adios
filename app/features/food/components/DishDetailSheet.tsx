import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type RestaurantMenuStyles } from "../restaurant-menu.styles";
import { DishImageCarousel } from "./DishImageCarousel";
import { BestsellerBadge, NutritionLine } from "./DishHighlights";
import { DishPrice } from "@/components/shared/DishPrice";
import { useCartStore } from "@/contexts/cartStore";
import { effectivePrice } from "@/utils/pricing";
import { CookingRequestCard } from "./CookingRequestCard";

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
  /** A meat centre: the note box asks about the cut instead of cooking. */
  isMeat?: boolean;
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
  isMeat = false,
}: Props) {
  const { t } = useTranslation();
  // The note lives in the cart store: on the dish once it is in the cart, as a draft before.
  const dishId = selectedDishDetail?._id as string | undefined;
  const note = useCartStore((st) => (dishId ? st.items.find((i) => i._id === dishId)?.cookingRequest ?? st.draftNotes[dishId] ?? "" : ""));
  const setItemNote = useCartStore((st) => st.setItemNote);
  // How many to add when the dish is not in the cart yet; each dish opens on 1.
  const [qty, setQty] = useState(1);
  useEffect(() => { setQty(1); }, [dishId]);
  return (
    <Modal visible={!!selectedDishDetail} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={styles.modalBackdrop}>
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
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedDishDetail(null)}
              accessibilityRole="button"
              accessibilityLabel={t("app.support.closeModal")}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <ScrollView style={styles.modalScrollBody} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeadRow}>
                <View style={[styles.dietIcon, { borderColor: selectedDishDetail.isVeg ? tokens.veg : tokens.nonveg }]}>
                  {selectedDishDetail.isVeg ? (
                    <View style={[styles.vegDotSmall, { backgroundColor: tokens.veg }]} />
                  ) : (
                    <View style={styles.nonvegTriangle} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {selectedDishDetail.isBestseller && <BestsellerBadge tokens={tokens} style={{ marginBottom: 6 }} />}
                  <Text style={styles.modalTitle}>{selectedDishDetail.name}</Text>
                  <DishPrice
                    price={selectedDishDetail.price}
                    offerPrice={selectedDishDetail.offerPrice}
                    discountPercent={selectedDishDetail.discountPercent}
                    priceStyle={styles.modalPrice}
                  />
                  <NutritionLine calories={selectedDishDetail.calories} protein={selectedDishDetail.protein} tokens={tokens} style={{ marginTop: 6 }} />
                </View>
                <TouchableOpacity
                  style={styles.modalFavoriteBtn}
                  onPress={() => toggleFavoriteItem(selectedDishDetail._id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={isDishFavorite(selectedDishDetail._id) ? t("app.food.removeFromFavorites") : t("app.food.addToFavorites")}
                >
                  <Ionicons
                    name={isDishFavorite(selectedDishDetail._id) ? "heart" : "heart-outline"}
                    size={moderateScale(20)}
                    color={isDishFavorite(selectedDishDetail._id) ? accent.accent : tokens.sec}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalFavoriteBtn}
                  onPress={() => shareRestaurant(id as string, name as string, selectedDishDetail._id, selectedDishDetail.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={t("app.food.share")}
                >
                  <Ionicons name="arrow-redo-outline" size={moderateScale(20)} color={tokens.text} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalDesc}>{selectedDishDetail.description}</Text>
              <CookingRequestCard value={note} onChange={(v) => setItemNote(selectedDishDetail._id, v)} isMeat={isMeat} tokens={tokens} />
            </ScrollView>
            <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 20 }]}>
              {selectedDishDetail.isAvailable === false ? (
                <View style={styles.modalSoldOut}><Text style={styles.soldOutText}>{t("app.food.currentlySoldOut")}</Text></View>
              ) : outletClosed && !items.find((i) => i._id === selectedDishDetail._id) ? (
                <View style={styles.modalSoldOut}><Text style={styles.soldOutText}>{t("app.food.notAcceptingOrdersNow")}</Text></View>
              ) : items.find((i) => i._id === selectedDishDetail._id) ? (
                <View style={styles.modalQtyRow}>
                  <TouchableOpacity
                    style={styles.modalQtyBtn}
                    onPress={() => handleUpdateQuantity(selectedDishDetail._id, (items.find((i) => i._id === selectedDishDetail._id)?.quantity || 1) - 1)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={t("app.food.decreaseQuantity")}
                  >
                    <Feather name="minus" size={16} color={accent.accent} />
                  </TouchableOpacity>
                  <Text style={styles.modalQtyText}>{items.find((i) => i._id === selectedDishDetail._id)?.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.modalQtyBtn, outletClosed && { opacity: 0.35 }]}
                    onPress={() => handleAddToCart(selectedDishDetail)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={t("app.food.increaseQuantity")}
                  >
                    <Feather name="plus" size={16} color={accent.accent} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 }}>
                  <View style={[styles.modalQtyRow, { marginTop: 0 }]}>
                    <TouchableOpacity
                      style={styles.modalQtyBtn}
                      onPress={() => setQty((q) => Math.max(1, q - 1))}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel={t("app.food.decreaseQuantity")}
                    >
                      <Feather name="minus" size={16} color={accent.accent} />
                    </TouchableOpacity>
                    <Text style={styles.modalQtyText}>{qty}</Text>
                    <TouchableOpacity
                      style={styles.modalQtyBtn}
                      onPress={() => setQty((q) => Math.min(20, q + 1))}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel={t("app.food.increaseQuantity")}
                    >
                      <Feather name="plus" size={16} color={accent.accent} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={[styles.modalAddBtn, { flex: 1, marginTop: 0 }]} activeOpacity={0.85} onPress={() => handleAddToCart(selectedDishDetail, qty)}>
                    <Text style={styles.modalAddBtnText}>{t("app.food.addItem", "Add item")} ₹{Math.round(effectivePrice(selectedDishDetail) * qty)}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
