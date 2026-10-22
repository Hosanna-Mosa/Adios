import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type FindingDriverStyles } from "@/features/ride/finding-driver.styles";

// Moved out of app/finding-driver.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  CANCEL_REASONS: any[];
  accent: ServiceTokens;
  cancelReason: any;
  handleCancel: () => void;
  insets: EdgeInsets;
  /** Picks "ride" vs "order" wording on the cancel button, matching FindingDriverSheet. */
  isRide: boolean;
  setCancelReason: React.Dispatch<React.SetStateAction<any>>;
  setShowCancelSheet: React.Dispatch<React.SetStateAction<any>>;
  showCancelSheet: boolean;
  /** Package delivery: delivery-partner wording instead of ride wording. */
  isPackageDelivery?: boolean;
  /** Restaurant order: order wording instead of ride wording. */
  isFoodOrder?: boolean;
  styles: FindingDriverStyles;
}

export function CancelRideSheet({
  CANCEL_REASONS,
  accent,
  cancelReason,
  handleCancel,
  insets,
  isRide,
  setCancelReason,
  setShowCancelSheet,
  showCancelSheet,
  styles,
  isPackageDelivery = false,
  isFoodOrder = false,
}: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={showCancelSheet} transparent animationType="slide" onRequestClose={() => setShowCancelSheet(false)}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity activeOpacity={1} style={styles.sheetScrim} onPress={() => setShowCancelSheet(false)} />
        <View style={[styles.cancelSheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.cancelSheetTitle}>{t("app.ride.whyDoYouWantToCancel")}</Text>
          <Text style={styles.cancelSheetSub}>{isFoodOrder ? t("app.foodOrder.noFeeNoPartnerYet") : isPackageDelivery ? t("app.packageDelivery.noFeeNoPartnerYet") : t("app.ride.noCancellationFeeWeHavenapostAssigned")}</Text>

          <View style={{ gap: 8, marginBottom: 18 }}>
            {CANCEL_REASONS.map((reason) => {
              const isSelected = cancelReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonRow, isSelected && { borderColor: accent.accent, backgroundColor: accent.skin }]}
                  onPress={() => setCancelReason(reason)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.radioOuter, isSelected && { borderColor: accent.accent }]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: accent.accent }]} />}
                  </View>
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              style={[styles.cancelSheetCancelBtn, !cancelReason && { opacity: 0.5 }]}
              onPress={handleCancel}
              activeOpacity={0.85}
              disabled={!cancelReason}
              accessibilityState={{ disabled: !cancelReason }}
            >
              <Text style={styles.cancelSheetCancelBtnText}>
                {isFoodOrder
                  ? t("app.foodOrder.cancelOrder")
                  : isPackageDelivery
                    ? t("app.packageDelivery.cancelDelivery")
                    : isRide
                      ? t("app.ride.cancelRideLower")
                      : t("app.ride.cancelOrderLower")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelSheetKeepBtn, { backgroundColor: accent.accent }]} onPress={() => setShowCancelSheet(false)} activeOpacity={0.9}>
              <Text style={[styles.cancelSheetKeepBtnText, { color: accent.on }]}>{isFoodOrder ? t("app.foodOrder.keepOrder") : t("app.ride.keepSearching")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
