import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import type { ThemeTokens } from "@/constants/colors";
import type { FoodItemInput } from "@/types/models";
import { parseNumber } from "@/utils/number";
import { createPreviewStyles } from "../dishPreview.styles";
import { PriceTag } from "./PriceTag";
import { VegMarker } from "./VegMarker";

interface Props {
  visible: boolean;
  form: FoodItemInput;
  isEdit: boolean;
  saving: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  tokens: ThemeTokens;
}

/** The dish exactly as customers will see it, before it is saved — Edit goes back, only Confirm saves. */
export function DishPreviewSheet({ visible, form, isEdit, saving, onEdit, onConfirm, tokens }: Props) {
  const { t } = useTranslation();
  const styles = useMemo(() => createPreviewStyles(tokens), [tokens]);
  const image = form.images[0];
  const protein = parseNumber(form.protein);
  const calories = parseNumber(form.calories);
  const minOrders = Number(form.bestsellerMinOrders) || 0;
  const bestseller = !form.promoteBestseller
    ? t("dishPreview.bestsellerOff")
    : minOrders > 0
      ? t("dishPreview.bestsellerAfter", { count: minOrders })
      : t("dishPreview.bestsellerNow");

  return (
    <BottomSheet visible={visible} onClose={onEdit} dismissible={!saving} title={t("dishPreview.title")} subtitle={t("dishPreview.subtitle")}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
          ) : (
            <Ionicons name="fast-food-outline" size={40} color={tokens.muted} />
          )}
          {form.promoteBestseller && minOrders === 0 ? (
            <View style={styles.badgeOverlay}>
              <Badge label={t("menu.bestseller")} tone="warning" icon="flame" />
            </View>
          ) : null}
        </View>
        <View style={styles.nameRow}>
          <VegMarker isVeg={form.isVeg} styles={styles} tokens={tokens} />
          <Text style={styles.name}>{form.name.trim()}</Text>
        </View>
        <Text style={styles.category}>{form.category.trim()}</Text>
        {form.description.trim() ? <Text style={styles.description}>{form.description.trim()}</Text> : null}
        <PriceTag price={parseNumber(form.price) ?? 0} offerPrice={parseNumber(form.offerPrice)} tokens={tokens} />
        {protein != null || calories != null ? (
          <View style={styles.chips}>
            {protein != null ? <Badge label={t("dishPreview.protein", { value: protein })} tone="info" icon="barbell-outline" /> : null}
            {calories != null ? <Badge label={t("dishPreview.calories", { value: calories })} tone="neutral" icon="flame-outline" /> : null}
          </View>
        ) : null}
        <View style={styles.setting}>
          <Ionicons name="trophy-outline" size={16} color={tokens.sec} />
          <Text style={styles.settingText}>{bestseller}</Text>
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <Button title={t("dishPreview.edit")} variant="secondary" onPress={onEdit} disabled={saving} style={styles.action} />
        <Button
          title={isEdit ? t("dishPreview.confirmSave") : t("dishPreview.confirmAdd")}
          onPress={onConfirm}
          loading={saving}
          style={styles.action}
        />
      </View>
    </BottomSheet>
  );
}
