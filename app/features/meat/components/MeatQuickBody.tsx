import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { type MeatStyles } from "@/features/meat/meat-centers.styles";

// Moved out of app/meat-centers.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeQuickFilters: any;
  styles: MeatStyles;
  toggleQuickFilter: any;
}

export function MeatQuickBody({
  activeQuickFilters,
  styles,
  toggleQuickFilter,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <TouchableOpacity
      style={[styles.chip, activeQuickFilters.has("fast") && styles.chipActive]}
      onPress={() => toggleQuickFilter("fast")}
    >
      <Text style={[styles.chipText, activeQuickFilters.has("fast") && styles.chipTextActive]}>{t("app.home.fastDelivery")}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.chip, activeQuickFilters.has("rating") && styles.chipActive]}
      onPress={() => toggleQuickFilter("rating")}
    >
      <Text style={[styles.chipText, activeQuickFilters.has("rating") && styles.chipTextActive]}>{t("app.home.ratings40")}</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.chip, activeQuickFilters.has("open") && styles.chipActive]}
      onPress={() => toggleQuickFilter("open")}
    >
      <Text style={[styles.chipText, activeQuickFilters.has("open") && styles.chipTextActive]}>{t("app.home.openNow")}</Text>
    </TouchableOpacity>
    </>
  );
}
