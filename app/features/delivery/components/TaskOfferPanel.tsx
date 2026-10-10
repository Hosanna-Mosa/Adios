import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "../helper-task.styles";
import { type ServiceTokens } from "@/constants/colors";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";

// Footer of the "Set your offer" step: payment method and the button that posts the
// task. The price is fixed — helpers are offered the task one at a time at it.

interface Props {
  accent: ServiceTokens;
  calculatedFare: number;
  createTask: () => void;
  insets: EdgeInsets;
  isCreating: boolean;
  offer: number | null;
  styles: HelperTaskStyles;
}

export function TaskOfferPanel({
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
      <Text style={styles.helperCountNote}>{t("app.delivery.offerGoesToHelpersOneAtATime")}</Text>
      <PaymentMethodSelector flow="helper" accent={accent} disabled={isCreating} style={{ marginBottom: 12 }} />
      <TouchableOpacity style={[styles.primaryBtn, isCreating && { opacity: 0.6 }]} onPress={createTask} disabled={isCreating}>
        <Text style={styles.primaryBtnText}>{t("app.delivery.findAHelper")}{offer ?? calculatedFare}</Text>
      </TouchableOpacity>
    </View>
  );
}
