import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type PaymentStyles } from "@/features/food/usePayment.shared";

// Moved out of app/payment.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  receiverContact: any;
  selectedAddress: any;
  styles: PaymentStyles;
}

export function PaymentAddressCard({
  receiverContact,
  selectedAddress,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressAvatar}>
        <Text style={styles.addressAvatarText}>{(selectedAddress?.label || "A")[0].toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.addressTitle}>{t("app.food.deliverTo")} {selectedAddress?.label || "…"}</Text>
        <Text style={styles.addressLine} numberOfLines={2}>{selectedAddress?.addressLine || t("app.food.noAddressSelected")}</Text>
        {!!receiverContact && <Text style={styles.addressContact}>{receiverContact}</Text>}
      </View>
    </View>
  );
}
