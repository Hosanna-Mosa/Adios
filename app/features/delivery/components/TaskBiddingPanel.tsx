import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/helper-task.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  calculatedFare: any;
  createTask: any;
  insets: any;
  isCreating: any;
  offer: any;
  styles: any;
}

export function TaskBiddingPanel({
  calculatedFare,
  createTask,
  insets,
  isCreating,
  offer,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <Text style={styles.helperCountNote}>{t("app.delivery.yourOfferIsVisibleToNearby")}</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={createTask} disabled={isCreating}>
        <Text style={styles.primaryBtnText}>{t("app.delivery.findAHelper")}{offer ?? calculatedFare}</Text>
      </TouchableOpacity>
    </View>
  );
}
