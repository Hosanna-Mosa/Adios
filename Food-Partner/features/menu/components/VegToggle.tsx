import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Chip } from "@/components/ui/Badge";
import type { ThemeTokens } from "@/constants/colors";
import type { DishFormStyles } from "../dishForm.styles";

interface Props {
  isVeg: boolean;
  onChange: (isVeg: boolean) => void;
  styles: DishFormStyles;
  tokens: ThemeTokens;
}

/** Veg / Non-veg — two Chips coloured with the food-label greens and reds. */
export function VegToggle({ isVeg, onChange, styles, tokens }: Props) {
  const { t } = useTranslation();
  const options = [
    { value: true, label: t("dishForm.veg"), color: tokens.veg },
    { value: false, label: t("dishForm.nonVeg"), color: tokens.nonveg },
  ];
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{t("dishForm.foodType")}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = isVeg === option.value;
          return (
            <Chip
              key={String(option.value)}
              label={option.label}
              selected={selected}
              accent={{ accent: option.color, on: "#FFFFFF" }}
              onPress={() => onChange(option.value)}
              icon={<View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: selected ? "#FFFFFF" : option.color }} />}
            />
          );
        })}
      </View>
    </View>
  );
}
