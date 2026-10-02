import { Image } from "expo-image";
import { Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type RestaurantMenuStyles } from "@/features/food/restaurant-menu.styles";

// Section of MenuBody, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  id: string | string[];
  image: any;
  isMeat: string;
  metaLine1Parts: any;
  metaLine2Parts: any;
  name: string | string[];
  rating: any;
  reviews: any;
  searchQuery: any;
  setSearchQuery: React.Dispatch<React.SetStateAction<any>>;
  setVegOnly: React.Dispatch<React.SetStateAction<boolean>>;
  styles: RestaurantMenuStyles;
  tokens: ThemeTokens;
  vegOnly: any;
}

export function MenuVegOnly({
  id,
  image,
  isMeat,
  metaLine1Parts,
  metaLine2Parts,
  name,
  rating,
  reviews,
  searchQuery,
  setSearchQuery,
  setVegOnly,
  styles,
  tokens,
  vegOnly,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <Image source={{ uri: (image as string) || "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600" }} style={styles.heroImage} contentFit="cover" transition={200} />

    <View style={styles.sheet}>
      <TouchableOpacity
        style={styles.titleRow}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/restaurant-details",
            params: { id: id as string, name: name as string, image: image as string, rating: rating as string, reviews: reviews as string, isMeat: isMeat as string },
          })
        }
      >
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            <Ionicons name="chevron-forward" size={moderateScale(16)} color={tokens.sec} />
          </View>
          {metaLine1Parts.length > 0 && (
            <Text style={styles.metaLine} numberOfLines={1}>{metaLine1Parts.join(" · ")}</Text>
          )}
          {metaLine2Parts.length > 0 && (
            <Text style={styles.metaLine} numberOfLines={1}>{metaLine2Parts.join(" · ")}</Text>
          )}
        </View>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingPillValue}>{rating || "—"} ★</Text>
          {!!reviews && <Text style={styles.ratingPillCount}>{reviews}</Text>}
        </View>
      </TouchableOpacity>

      {isMeat !== "true" && (
        <View style={styles.vegRow}>
          <View style={styles.vegLeft}>
            <View style={styles.vegIconBox}><View style={styles.vegDot} /></View>
            <Text style={styles.vegLabel}>{t("app.home.vegOnly")}</Text>
          </View>
          <TouchableOpacity
            style={[styles.vegSwitch, vegOnly && { backgroundColor: tokens.veg }]}
            activeOpacity={0.8}
            onPress={() => setVegOnly((v) => !v)}
          >
            <View style={[styles.vegSwitchKnob, vegOnly && { alignSelf: "flex-end" }]} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchRow}>
        <Ionicons name="search" size={moderateScale(15)} color={tokens.sec} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("app.food.searchInVar", { value: name })}
          placeholderTextColor={tokens.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={moderateScale(15)} color={tokens.sec} />
          </TouchableOpacity>
        )}
      </View>
    </View>
    </>
  );
}
