import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeTokens } from "@/constants/colors";
import type { FoodItemInput } from "@/types/models";
import { sanitizeDecimal, sanitizeInteger } from "@/utils/number";
import type { DishFormStyles } from "../dishForm.styles";

interface Props {
  form: FoodItemInput;
  update: <K extends keyof FoodItemInput>(key: K, value: FoodItemInput[K]) => void;
  errors: { protein?: string; calories?: string; bestsellerMinOrders?: string };
  styles: DishFormStyles;
  tokens: ThemeTokens;
}

/** Optional nutrition (protein, calories) and the "Promote as bestseller" setting. */
export function DishExtrasCard({ form, update, errors, styles, tokens }: Props) {
  const { t } = useTranslation();
  const count = Number(form.bestsellerMinOrders) || 0;
  return (
    <Card bordered elevationLevel="none" style={styles.card}>
      <View style={styles.row}>
        <TextField
          label={t("dishForm.protein")}
          placeholder={t("dishForm.optional")}
          value={form.protein}
          onChangeText={(v) => update("protein", sanitizeDecimal(v))}
          error={errors.protein}
          keyboardType="decimal-pad"
          right={<Text style={styles.unit}>g</Text>}
          containerStyle={styles.half}
        />
        <TextField
          label={t("dishForm.calories")}
          placeholder={t("dishForm.optional")}
          value={form.calories}
          onChangeText={(v) => update("calories", sanitizeDecimal(v))}
          error={errors.calories}
          keyboardType="decimal-pad"
          right={<Text style={styles.unit}>kcal</Text>}
          containerStyle={styles.half}
        />
      </View>
      <View style={styles.switchRow}>
        <View style={styles.switchTexts}>
          <Text style={styles.switchTitle}>{t("dishForm.promoteBestseller")}</Text>
          <Text style={styles.hint}>{t("dishForm.promoteBestsellerHint")}</Text>
        </View>
        <ToggleSwitch
          value={form.promoteBestseller}
          onValueChange={(v) => update("promoteBestseller", v)}
          onColor={tokens.brand}
          accessibilityLabel={t("dishForm.promoteBestseller")}
        />
      </View>
      {form.promoteBestseller ? (
        <View style={styles.field}>
          <TextField
            label={t("dishForm.bestsellerAfter")}
            placeholder="0"
            value={form.bestsellerMinOrders}
            onChangeText={(v) => update("bestsellerMinOrders", sanitizeInteger(v))}
            error={errors.bestsellerMinOrders}
            keyboardType="number-pad"
            maxLength={6}
            right={<Text style={styles.unit}>{t("dishForm.ordersUnit")}</Text>}
          />
          {!errors.bestsellerMinOrders ? (
            <Text style={styles.hint}>{count > 0 ? t("dishForm.bestsellerAfterHint", { count }) : t("dishForm.bestsellerNowHint")}</Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
