import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens } from "@/constants/colors";
import { useCartStore } from "@/contexts/cartStore";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from the
// screen's scope is now passed in as props.

interface Props {
  item: any;
  styles: HomeStyles;
  accent: ServiceTokens;
}

export function Store149Card({ item, styles, accent }: Props) {
  const { t } = useTranslation();
  const cItems = useCartStore((s) => s.items);
  const addCartItem = useCartStore((s) => s.requestAddItem);
  const cartItem = cItems.find((i) => i._id === item._id);

  const handleAdd = () => {
    const foodItem = {
      _id: item._id,
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category || t("app.food.categoryFallback.store149"),
      isVeg: item.isVeg,
      images: item.images && item.images.length > 0 ? item.images : [],
    };
    addCartItem(foodItem, item.vendorId, item.brand);
  };

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealImageWrap}>
        <Image
          source={item.images?.[0] ? { uri: item.images[0] } : null}
          style={styles.mealImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.mealPriceBadge}>
          <Text style={styles.mealPriceBadgeText}>₹{item.price}</Text>
        </View>
        <TouchableOpacity style={styles.mealAddBtn} onPress={handleAdd} activeOpacity={0.85}>
          {cartItem ? (
            <Text style={styles.mealAddBtnText}>{cartItem.quantity}</Text>
          ) : (
            <Feather name="plus" size={moderateScale(13)} color={accent.on} />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.mealName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.mealVendor} numberOfLines={1}>
        {item.brand || "Nearby"}
        {typeof item.distanceKm === "number" ? ` · ${item.distanceKm} km` : ""}{Number(item.rating) > 0 ? ` · ${item.rating} ★` : ""}
      </Text>
    </View>
  );
}
