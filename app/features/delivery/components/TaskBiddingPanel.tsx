import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";
import { type ServiceTokens } from "@/constants/colors";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";

// Moved out of app/helper-task.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  calculatedFare: number;
  createTask: any;
  insets: EdgeInsets;
  isCreating: boolean;
  offer: any;
  styles: HelperTaskStyles;
}

export function TaskBiddingPanel({
  accent,
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
      <PaymentMethodSelector flow="helper" accent={accent} disabled={isCreating} style={{ marginBottom: 12 }} />
      <TouchableOpacity style={styles.primaryBtn} onPress={createTask} disabled={isCreating}>
        <Text style={styles.primaryBtnText}>{t("app.delivery.findAHelper")}{offer ?? calculatedFare}</Text>
      </TouchableOpacity>
    </View>
  );
}
