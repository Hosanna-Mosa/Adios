import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { ActionTile } from "@/components/ui/ActionTile";
import { Chip } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeTokens } from "@/constants/colors";
import type { MeatItemInput } from "@/services/menu.service";
import { sanitizeDecimal } from "@/utils/number";
import type { DishFormStyles } from "../dishForm.styles";
import type { MeatItemErrors } from "../useMeatItemForm";

interface PhotoProps {
  image: string;
  uploading: boolean;
  onChange: () => void;
  styles: DishFormStyles;
}

/** The item's photo: a dashed "Add photo" tile, or the photo itself (tap to replace). */
export function MeatPhotoCard({ image, uploading, onChange, styles }: PhotoProps) {
  const { t } = useTranslation();
  return (
    <Card bordered elevationLevel="none" style={styles.field}>
      <Text style={styles.label}>{t("meatForm.photo")}</Text>
      {image ? (
        <Card elevationLevel="none" padding={0} onPress={onChange} accessibilityLabel={t("meatForm.changePhoto")}>
          <Image source={{ uri: image }} style={{ width: "100%", height: 160, borderRadius: 12 }} contentFit="cover" />
          <Text style={styles.hint}>{t("meatForm.changePhoto")}</Text>
        </Card>
      ) : (
        <View style={styles.photos}>
          <ActionTile dashed icon="camera-outline" label={t("dishForm.addPhoto")} loading={uploading} onPress={onChange} />
        </View>
      )}
    </Card>
  );
}

interface DetailsProps {
  form: MeatItemInput;
  update: <K extends keyof MeatItemInput>(key: K, value: MeatItemInput[K]) => void;
  errors: MeatItemErrors;
  categories: string[];
  /** A standard item: name, weight and category can't be changed. */
  fixedIdentity: boolean;
  styles: DishFormStyles;
  tokens: ThemeTokens;
}

/** Name, weight, category, selling price and description. */
export function MeatDetailsCard({ form, update, errors, categories, fixedIdentity, styles, tokens }: DetailsProps) {
  const { t } = useTranslation();
  return (
    <Card bordered elevationLevel="none" style={styles.card}>
      <TextField
        label={t("meatForm.name")}
        placeholder={t("meatForm.namePlaceholder")}
        value={form.name}
        onChangeText={(v) => update("name", v)}
        error={errors.name}
        editable={!fixedIdentity}
        maxLength={80}
      />
      <TextField
        label={t("meatForm.weight")}
        placeholder={t("meatForm.weightPlaceholder")}
        value={form.weight}
        onChangeText={(v) => update("weight", v)}
        error={errors.weight}
        editable={!fixedIdentity}
        maxLength={40}
      />
      <View style={styles.field}>
        <Text style={styles.label}>{t("meatForm.category")}</Text>
        <View style={styles.chips}>
          {categories.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={form.category.trim().toLowerCase() === c.toLowerCase()}
              onPress={() => !fixedIdentity && update("category", c)}
              accent={tokens.services.meat}
            />
          ))}
        </View>
        {!fixedIdentity ? (
          <TextField placeholder={t("meatForm.categoryPlaceholder")} value={form.category} onChangeText={(v) => update("category", v)} error={errors.category} maxLength={40} />
        ) : null}
      </View>
      <TextField
        label={t("meat.sellingPrice")}
        placeholder="0"
        value={form.price}
        onChangeText={(v) => update("price", sanitizeDecimal(v))}
        error={errors.price}
        keyboardType="decimal-pad"
        icon={<Text style={styles.rupee}>₹</Text>}
      />
      <TextField
        label={t("meatForm.description")}
        placeholder={t("meatForm.descriptionPlaceholder")}
        value={form.description}
        onChangeText={(v) => update("description", v)}
        multiline
        multilineHeight={90}
        maxLength={300}
      />
    </Card>
  );
}

/** The in-stock switch: customers can order the item only while it is on. */
export function MeatStockCard({ value, onChange, styles }: { value: boolean; onChange: (v: boolean) => void; styles: DishFormStyles }) {
  const { t } = useTranslation();
  return (
    <Card bordered elevationLevel="none">
      <View style={styles.switchRow}>
        <View style={styles.switchTexts}>
          <Text style={styles.switchTitle}>{t("meatForm.inStock")}</Text>
          <Text style={styles.hint}>{t("meatForm.inStockHint")}</Text>
        </View>
        <ToggleSwitch value={value} onValueChange={onChange} accessibilityLabel={t("meatForm.inStock")} />
      </View>
    </Card>
  );
}
