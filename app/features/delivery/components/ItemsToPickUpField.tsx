import { Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type AddStopStyles } from "@/features/delivery/add-stop.styles";

// Moved out of app/delivery/add-stop.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  addItemToLocal: any;
  items: any[];
  newItemName: string;
  newItemPrice: any;
  removeItemFromLocal: any;
  setNewItemName: any;
  setNewItemPrice: any;
  styles: AddStopStyles;
  tokens: ThemeTokens;
}

export function ItemsToPickUpField({
  accent,
  addItemToLocal,
  items,
  newItemName,
  newItemPrice,
  removeItemFromLocal,
  setNewItemName,
  setNewItemPrice,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <View style={styles.itemsHeadRow}>
        <Text style={styles.sectionLabel}>{t("app.delivery.whatToPickUp")}</Text>
        <Text style={styles.itemsCount}>{t("app.food.itemCount", { count: items.length })}</Text>
      </View>
      <View style={styles.itemsCard}>
        {items.map((item, idx) => (
          <View key={item.id} style={[styles.itemRow, idx < items.length && styles.itemRowDivider]}>
            <View style={styles.itemQtyBadge}><Text style={styles.itemQtyBadgeText}>{item.quantity}</Text></View>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            {item.estimatedPrice != null && <Text style={styles.itemPrice}>₹{item.estimatedPrice}</Text>}
            <TouchableOpacity onPress={() => removeItemFromLocal(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={15} color={tokens.sec} />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addItemRow}>
          <TextInput
            style={styles.addItemInput}
            placeholder={t("app.delivery.itemName")}
            placeholderTextColor={tokens.muted}
            value={newItemName}
            onChangeText={setNewItemName}
            onSubmitEditing={addItemToLocal}
            returnKeyType="done"
          />
          <TextInput
            style={styles.addItemPriceInput}
            placeholder={t("app.delivery.est")}
            placeholderTextColor={tokens.muted}
            value={newItemPrice}
            onChangeText={setNewItemPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={addItemToLocal} disabled={!newItemName.trim()}>
            <Ionicons name="add-circle" size={26} color={newItemName.trim() ? accent.accent : tokens.muted} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemsHint}>{t("app.delivery.pricesAreYourEstimateTheRider")}</Text>
    </View>
  );
}
