import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Chip } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import type { ThemeTokens } from "@/constants/colors";
import type { FoodItemInput } from "@/types/models";
import type { DishFormStyles } from "../dishForm.styles";
import { VegToggle } from "./VegToggle";

interface Props {
  form: FoodItemInput;
  update: <K extends keyof FoodItemInput>(key: K, value: FoodItemInput[K]) => void;
  errors: { name?: string; price?: string; category?: string };
  categories: string[];
  styles: DishFormStyles;
  tokens: ThemeTokens;
}

/** Name, price, category (with suggestions), description and veg/non-veg. */
export function DishDetailsCard({ form, update, errors, categories, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <Card bordered elevationLevel="none" style={styles.card}>
      <TextField label={t("dishForm.name")} placeholder={t("dishForm.namePlaceholder")} value={form.name} onChangeText={(v) => update("name", v)} error={errors.name} maxLength={80} />
      <TextField
        label={t("dishForm.price")}
        placeholder="299"
        value={form.price}
        onChangeText={(v) => update("price", v.replace(/[^0-9.]/g, ""))}
        error={errors.price}
        keyboardType="decimal-pad"
        icon={<Text style={styles.rupee}>₹</Text>}
      />
      <View style={styles.field}>
        <TextField
          label={t("dishForm.category")}
          placeholder={t("dishForm.categoryPlaceholder")}
          value={form.category}
          onChangeText={(v) => update("category", v)}
          error={errors.category}
          maxLength={40}
        />
        {categories.length ? (
          <View style={styles.chips}>
            {categories.map((c) => (
              <Chip key={c} label={c} selected={form.category.trim() === c} onPress={() => update("category", c)} />
            ))}
          </View>
        ) : null}
      </View>
      <TextField
        label={t("dishForm.description")}
        placeholder={t("dishForm.descriptionPlaceholder")}
        value={form.description}
        onChangeText={(v) => update("description", v)}
        multiline
        multilineHeight={110}
        maxLength={300}
      />
      <VegToggle isVeg={form.isVeg} onChange={(v) => update("isVeg", v)} styles={styles} tokens={tokens} />
    </Card>
  );
}
