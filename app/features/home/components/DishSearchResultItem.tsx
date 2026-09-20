import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { useCartStore } from "@/contexts/cartStore";

// Moved out of app/(tabs)/index.tsx unchanged. Home-only for now: promote to
// components/ui/ or components/shared/ if a second feature ever needs it.

export function DishSearchResultItem({ item, tokens, accent, styles }: { item: any; tokens: ThemeTokens; accent: ServiceTokens; styles: any }) {
  const items = useCartStore((s) => s.items);
  const requestAddItem = useCartStore((s) => s.requestAddItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItem = items.find((i) => i._id === item._id);
  const vendor = item.vendorId;
  const soldOut = item.isAvailable === false;

  const handleAdd = () => {
    if (soldOut) return;
    if (vendor?._id) requestAddItem(item, vendor._id, vendor?.name);
  };

  const handleNavigateToMenu = () => {
    if (vendor?._id) {
      router.push({
        pathname: "/restaurant-menu",
        params: { id: vendor._id, name: vendor.name, image: vendor.image || "", rating: String(vendor.rating || "4.8"), reviews: vendor.reviews || "2k+", isMeat: "false", highlightDishId: item._id },
      });
    }
  };

  return (
    <View style={styles.dishMenuItem}>
      <TouchableOpacity style={styles.dishItemInfo} activeOpacity={0.7} onPress={handleNavigateToMenu}>
        <View style={styles.dishItemTitleRow}>
          <View style={[styles.dishVegIndicator, { borderColor: item.isVeg ? tokens.veg : tokens.nonveg }]}>
            <View style={[styles.dishVegDot, { backgroundColor: item.isVeg ? tokens.veg : tokens.nonveg }]} />
          </View>
          <Text style={styles.dishItemName} numberOfLines={1}>{item.name}</Text>
        </View>
        <Text style={styles.dishItemPrice}>₹{item.price}</Text>
        <Text style={styles.dishItemDesc} numberOfLines={2}>{item.description}</Text>
        {vendor && (
          <View style={styles.dishVendorRow}>
            <Ionicons name="storefront-outline" size={moderateScale(13)} color={tokens.sec} />
            <Text style={styles.dishVendorText} numberOfLines={1}>from {vendor.name}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.dishItemImageContainer}>
        <TouchableOpacity activeOpacity={0.85} onPress={handleNavigateToMenu}>
          <Image source={{ uri: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400" }} style={styles.dishItemImage} contentFit="cover" transition={200} />
        </TouchableOpacity>
        <View style={styles.dishAddButtonOverlay}>
          {soldOut ? (
            <View style={styles.dishSoldOutPill}>
              <Text style={styles.dishSoldOutPillText}>SOLD OUT</Text>
            </View>
          ) : cartItem ? (
            <View style={styles.dishQuantityPill}>
              <TouchableOpacity onPress={() => updateQuantity(item._id, cartItem.quantity - 1)} style={styles.dishQtyActionBtn}>
                <Feather name="minus" size={moderateScale(12)} color={accent.accent} />
              </TouchableOpacity>
              <Text style={styles.dishQtyText}>{cartItem.quantity}</Text>
              <TouchableOpacity onPress={handleAdd} style={styles.dishQtyActionBtn}>
                <Feather name="plus" size={moderateScale(12)} color={accent.accent} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleAdd} style={styles.dishAddPill} activeOpacity={0.85}>
              <Text style={styles.dishAddPillText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
