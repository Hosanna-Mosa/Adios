import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeTokens } from "@/constants/colors";
import type { MeatItem } from "@/types/models";
import { formatCurrency } from "@/utils/format";
import type { MeatStyles } from "../meat.styles";

interface Props {
  item: MeatItem;
  toggling: boolean;
  onToggle: (isAvailable: boolean) => void;
  onEditPrice: () => void;
  styles: MeatStyles;
  tokens: ThemeTokens;
}

/** One meat item's stock switch and selling price — the panel's VendorMeatMenuItemCard. */
export function MeatItemCard({ item, toggling, onToggle, onEditPrice, styles, tokens }: Props) {
  const { t } = useTranslation();
  const meat = tokens.services.meat;
  return (
    <Card bordered dashed={!item.isAvailable} elevationLevel="none" padding={14} style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.iconTile, { backgroundColor: item.isAvailable ? meat.skin : tokens.sunken }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={[styles.image, !item.isAvailable && styles.imageDim]} contentFit="cover" />
          ) : (
            <MaterialCommunityIcons name="food-drumstick" size={26} color={item.isAvailable ? meat.accent : tokens.muted} />
          )}
        </View>
        <View style={styles.texts}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.weight}>{[item.weight, item.category].filter(Boolean).join(" · ")}</Text>
          <View style={styles.badge}>
            <Badge label={item.isAvailable ? t("menu.inStock") : t("menu.outOfStock")} tone={item.isAvailable ? "success" : "error"} />
          </View>
        </View>
        <ToggleSwitch value={item.isAvailable} onValueChange={onToggle} disabled={toggling} accessibilityLabel={t("menu.availabilityFor", { name: item.name })} />
      </View>
      <ListRow
        icon="pricetag-outline"
        iconColor={tokens.brand}
        iconBackground={tokens.surface}
        label={t("meat.sellingPrice")}
        onPress={onEditPrice}
        style={styles.priceRow}
        right={
          <View style={styles.priceRight}>
            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
            <Ionicons name="pencil" size={16} color={tokens.brand} />
          </View>
        }
      />
    </Card>
  );
}
