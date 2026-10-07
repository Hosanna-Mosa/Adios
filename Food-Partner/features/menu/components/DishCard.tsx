import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeTokens } from "@/constants/colors";
import { isInStock } from "@/queries/menu.queries";
import type { FoodItem } from "@/types/models";
import type { MenuStyles } from "../menu.styles";
import { BestsellerTag } from "./BestsellerTag";
import { PriceTag } from "./PriceTag";
import { VegMarker } from "./VegMarker";

interface Props {
  item: FoodItem;
  toggling: boolean;
  onToggle: (isAvailable: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  styles: MenuStyles;
  tokens: ThemeTokens;
}

/** One dish: photo, veg marker, name, price (with any offer), bestseller state, and the in-stock switch — the web panel's FoodItemCard. */
export function DishCard({ item, toggling, onToggle, onEdit, onDelete, styles, tokens }: Props) {
  const { t } = useTranslation();
  const inStock = isInStock(item);
  const image = item.images?.[0];

  return (
    <Card bordered dashed={!inStock} elevationLevel="none" style={styles.dishCard}>
      <View style={styles.dishRow}>
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: image }} style={[styles.image, !inStock && styles.imageDim]} contentFit="cover" transition={200} />
          ) : (
            <Ionicons name="fast-food-outline" size={30} color={tokens.muted} />
          )}
          {!inStock ? (
            <View style={styles.soldOutTag}>
              <Text style={styles.soldOutText}>{t("menu.soldOut")}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.dishBody}>
          {item.category ? (
            <Text style={styles.category} numberOfLines={1}>
              {item.category}
            </Text>
          ) : null}
          <View style={styles.nameRow}>
            <VegMarker isVeg={item.isVeg} styles={styles} tokens={tokens} />
            <Text style={styles.dishName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <PriceTag price={item.price} offerPrice={item.offerPrice} tokens={tokens} />
          <BestsellerTag item={item} styles={styles} />
        </View>
      </View>
      <View style={styles.dishFooter}>
        <ToggleSwitch value={inStock} onValueChange={onToggle} disabled={toggling} accessibilityLabel={t("menu.availabilityFor", { name: item.name })} />
        <View style={styles.stockTexts}>
          <Text style={[styles.stockLabel, { color: inStock ? tokens.success : tokens.error }]}>{inStock ? t("menu.inStock") : t("menu.outOfStock")}</Text>
          <Text style={styles.stockHint} numberOfLines={1}>
            {inStock ? t("menu.customersCanOrder") : t("menu.showsSoldOut")}
          </Text>
        </View>
        <View style={styles.actions}>
          <IconButton icon="create-outline" size={36} accessibilityLabel={t("menu.editDish", { name: item.name })} onPress={onEdit} />
          <IconButton icon="trash-outline" size={36} color={tokens.error} background={tokens.errorSkin} accessibilityLabel={t("menu.deleteDish", { name: item.name })} onPress={onDelete} />
        </View>
      </View>
    </Card>
  );
}
