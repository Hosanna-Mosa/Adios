import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { ServiceTokens } from "@/constants/colors";
import type { PaymentMethod } from "@/contexts/paymentMethodStore";
import type { PackageDeliveryPayAt } from "@/contexts/packageDeliveryStore";
import { PaymentMethodSelector } from "@/components/shared/PaymentMethodSelector";
import type { PackageDeliveryConfirmStyles } from "../packageDeliveryConfirm.styles";

// Cash or online; for cash, whether the sender pays at pickup or the receiver at drop;
// then Book.

interface Props {
  paymentMethod: PaymentMethod;
  payAt: PackageDeliveryPayAt;
  fare: number | undefined;
  canBook: boolean;
  booking: boolean;
  styles: PackageDeliveryConfirmStyles;
  accent: ServiceTokens;
  onPayAt: (payAt: PackageDeliveryPayAt) => void;
  onBook: () => void;
}

const PAY_AT: PackageDeliveryPayAt[] = ["pickup", "drop"];

export function PackageDeliveryPayBar({ paymentMethod, payAt, fare, canBook, booking, styles, accent, onPayAt, onBook }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <PaymentMethodSelector flow="packageDelivery" accent={accent} disabled={booking} />

      {paymentMethod === "cash" && (
        <>
          <View style={styles.payAtRow}>
            <Text style={styles.payAtLabel}>{t("app.packageDelivery.payAt")}</Text>
            <View style={styles.segment} accessibilityRole="radiogroup">
              {PAY_AT.map((option) => {
                const on = option === payAt;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.segmentBtn, on && styles.segmentBtnOn]}
                    onPress={() => onPayAt(option)}
                    disabled={booking}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                  >
                    <Text style={[styles.segmentText, on && styles.segmentTextOn]}>
                      {option === "pickup" ? t("app.packageDelivery.payAtPickup") : t("app.packageDelivery.payAtDrop")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <Text style={styles.payAtHint}>{payAt === "pickup" ? t("app.packageDelivery.payAtPickupHint") : t("app.packageDelivery.payAtDropHint")}</Text>
        </>
      )}

      <TouchableOpacity
        style={[styles.bookBtn, !canBook && styles.bookBtnOff]}
        onPress={onBook}
        disabled={!canBook}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canBook, busy: booking }}
      >
        {booking ? (
          <ActivityIndicator size="small" color={accent.on} />
        ) : (
          <>
            <Text style={styles.bookText}>{t("app.packageDelivery.book")}</Text>
            {fare != null && <Text style={styles.bookPrice}>· ₹{Math.round(fare)}</Text>}
          </>
        )}
      </TouchableOpacity>
    </>
  );
}
