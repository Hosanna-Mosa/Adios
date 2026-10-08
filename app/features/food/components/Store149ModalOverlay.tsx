import { Image, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { DietMarker } from "./DietMarker";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type Store149Styles } from "@/features/food/149-store.styles";

// Moved out of app/149-store.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  buildFoodItem: any;
  accent: ServiceTokens;
  addCartItem: any;
  cartItems: any[];
  insets: EdgeInsets;
  selectedItem: any;
  setIsSheetVisible: any;
  styles: Store149Styles;
  tokens: ThemeTokens;
  updateCartQuantity: any;
}

export function Store149ModalOverlay({
  buildFoodItem,
  accent,
  addCartItem,
  cartItems,
  insets,
  selectedItem,
  setIsSheetVisible,
  styles,
  tokens,
  updateCartQuantity,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setIsSheetVisible(false)} />
      <View style={[styles.sheetModal, { paddingBottom: insets.bottom + 32 }]}>
        <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setIsSheetVisible(false)}>
          <Ionicons name="close" size={moderateScale(20)} color={tokens.bg} />
        </TouchableOpacity>

        {selectedItem && (
          <View>
            <Image
              source={selectedItem.images?.[0] ? { uri: selectedItem.images[0] } : undefined}
              style={styles.sheetImage}
              resizeMode="cover"
            />
            <View style={styles.sheetInfo}>
              <View style={styles.sheetRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <DietMarker isVeg={!!selectedItem.isVeg} color={selectedItem.isVeg ? tokens.veg : tokens.nonveg} style={{ marginRight: 8 }} />
                  <Text style={styles.sheetVegLabel}>{selectedItem.isVeg ? t("app.food.veg") : t("app.food.nonveg")}</Text>
                </View>
                {(() => {
                  const cartItem = cartItems.find((i) => i._id === selectedItem._id);
                  return cartItem ? (
                    <View style={styles.sheetQtyPill}>
                      <TouchableOpacity onPress={() => updateCartQuantity(selectedItem._id, cartItem.quantity - 1)} style={styles.qtyBtn}>
                        <Feather name="minus" size={moderateScale(15)} color={accent.accent} />
                      </TouchableOpacity>
                      <Text style={styles.sheetQtyText}>{cartItem.quantity}</Text>
                      <TouchableOpacity onPress={() => addCartItem(buildFoodItem(selectedItem), selectedItem.vendorId, selectedItem.brand)} style={styles.qtyBtn}>
                        <Feather name="plus" size={moderateScale(15)} color={accent.accent} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.sheetAddBtn} onPress={() => addCartItem(buildFoodItem(selectedItem), selectedItem.vendorId, selectedItem.brand)}>
                      <Text style={styles.sheetAddBtnText}>{t("app.food.add")}</Text>
                    </TouchableOpacity>
                  );
                })()}
              </View>

              <Text style={styles.sheetTitle}>{selectedItem.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={styles.sheetPrice}>₹{selectedItem.price}</Text>
                {Number(selectedItem.originalPrice) > Number(selectedItem.price) && <Text style={styles.cardOriginalPrice}>₹{selectedItem.originalPrice}</Text>}
              </View>
              {/* Only what the outlet really has — no stand-in rating or blurb. */}
              {(Number(selectedItem.rating) > 0 || typeof selectedItem.distanceKm === "number") && (
                <Text style={styles.sheetRating}>
                  {Number(selectedItem.rating) > 0 ? `${selectedItem.rating} ★` : ""}
                  {Number(selectedItem.reviewsCount) > 0 ? ` (${selectedItem.reviewsCount} ${t("app.food.ratings")}` : ""}
                  {typeof selectedItem.distanceKm === "number"
                    ? `${Number(selectedItem.rating) > 0 ? " · " : ""}${selectedItem.distanceKm} km away`
                    : ""}
                </Text>
              )}
              {!!selectedItem.description && (
                <Text style={styles.sheetDescription}>{selectedItem.description}</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
