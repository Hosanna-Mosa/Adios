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

export function ItemFavoriteCard({ item, index, tokens, styles, onUnfavorite }: { item: any; index: number; tokens: ThemeTokens; styles: any; onUnfavorite: (itemId: string) => void }) {
  const isMeat = !!item.isMeat;
  const accent = tokens.services[isMeat ? "meat" : "food"];

  return (
    <Animated.View style={styles.card} entering={staggerListItem(index)}>
      <TouchableOpacity
        style={styles.cardThumb}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: "/restaurant-menu", params: { id: item.vendorId, isMeat: isMeat ? "true" : "false", highlightDishId: item._id } })}
      >
        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      </TouchableOpacity>
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={() => onUnfavorite(item._id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="heart" size={moderateScale(16)} color={accent.accent} />
          </TouchableOpacity>
        </View>
        {isMeat && (
          <View style={[styles.serviceTag, { backgroundColor: accent.skin }]}>
            <Text style={[styles.serviceTagText, { color: accent.accent }]}>Meat</Text>
          </View>
        )}
        <Text style={styles.cardMeta} numberOfLines={1}>₹{item.price}</Text>
        <TouchableOpacity
          style={[styles.reorderBtn, { backgroundColor: accent.accent }]}
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: "/restaurant-menu", params: { id: item.vendorId, isMeat: isMeat ? "true" : "false", highlightDishId: item._id } })}
        >
          <Text style={[styles.reorderBtnText, { color: accent.on }]}>View dish</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
