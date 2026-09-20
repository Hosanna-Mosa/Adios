import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";

// Moved out of app/favorites.tsx unchanged. Single-feature for now: promote to
// components/ui/ or components/shared/ if a second feature needs it.

export function FavoriteCard({ item, index, tokens, styles }: { item: any; index: number; tokens: ThemeTokens; styles: any }) {
  const isMeat = item.partnerType === "meat";
  const accent = tokens.services[isMeat ? "meat" : "food"];
  const categoryLabel = Array.isArray(item.categories) ? item.categories.slice(0, 2).join(", ") : item.categories;

  return (
    <Animated.View style={styles.card} entering={staggerListItem(index)}>
      <TouchableOpacity
        style={styles.cardThumb}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: "/restaurant-menu", params: { id: item._id, name: item.name, image: item.image || "", isMeat: isMeat ? "true" : "false" } })}
      >
        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      </TouchableOpacity>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Ionicons name="heart" size={moderateScale(16)} color={accent.accent} />
        </View>
        {isMeat && (
          <View style={[styles.serviceTag, { backgroundColor: accent.skin }]}>
            <Text style={[styles.serviceTagText, { color: accent.accent }]}>Meat</Text>
          </View>
        )}
        <Text style={styles.cardMeta} numberOfLines={1}>
          {categoryLabel}{item.deliveryFee != null ? ` · ₹${item.deliveryFee} delivery` : ""}
        </Text>
        <TouchableOpacity
          style={[styles.reorderBtn, { backgroundColor: accent.accent }]}
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: "/restaurant-menu", params: { id: item._id, name: item.name, image: item.image || "", isMeat: isMeat ? "true" : "false" } })}
        >
          <Text style={[styles.reorderBtnText, { color: accent.on }]}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
