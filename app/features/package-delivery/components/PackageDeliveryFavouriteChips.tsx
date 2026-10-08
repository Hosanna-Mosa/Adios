import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import type { ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryDetailsStyles } from "../packageDeliveryDetails.styles";
import { FAVOURITE_LABELS, type FavouriteLabel } from "../usePackageDeliveryDetails";
import { PackageDeliveryField } from "./PackageDeliveryContactForm";

// "Add to favourites": save this place to the customer's addresses under a label.
// Tapping the selected chip again unselects it; nothing is saved without a choice.

const ICONS: Record<FavouriteLabel, keyof typeof Ionicons.glyphMap> = {
  Home: "home", Work: "briefcase", Gym: "barbell", College: "school", Hostel: "bed", Other: "add",
};

interface Props {
  selected: FavouriteLabel | null;
  customLabel: string;
  styles: PackageDeliveryDetailsStyles;
  tokens: ThemeTokens;
  onSelect: (label: FavouriteLabel | null) => void;
  onCustomLabel: (text: string) => void;
}

export function PackageDeliveryFavouriteChips({ selected, customLabel, styles, tokens, onSelect, onCustomLabel }: Props) {
  const { t } = useTranslation();
  const labels: FavouriteLabel[] = [...FAVOURITE_LABELS, "Other"];
  return (
    <>
      <Text style={styles.sectionLabel}>{t("app.packageDelivery.addToFavourites")}</Text>
      <View style={styles.chips}>
        {labels.map((label) => {
          const on = selected === label;
          return (
            <TouchableOpacity
              key={label}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => onSelect(on ? null : label)}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
            >
              <Ionicons name={ICONS[label]} size={moderateScale(15)} color={on ? tokens.text : tokens.sec} />
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{t(`app.packageDelivery.favourite.${label.toLowerCase()}`)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selected === "Other" && (
        <View style={styles.customLabel}>
          <PackageDeliveryField styles={styles} tokens={tokens} icon="bookmark-outline" value={customLabel} placeholder={t("app.packageDelivery.favouriteName")} maxLength={30} onChange={onCustomLabel} />
        </View>
      )}
    </>
  );
}
