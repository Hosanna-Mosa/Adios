import React from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BookAgainOverlayBike } from "./BookAgainOverlayBike";
import { type RideSearchingStyles } from "@/features/ride/ride-searching.styles";

// Moved out of app/ride-searching.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  CANCEL_REASONS: any[];
  cancelConfirmVisible: any;
  cancelLocationAddress: any;
  cancelLocationLabel: string;
  cancelLocationTitle: string;
  cancelReasonVisible: any;
  cancelRide: any;
  cancelUsesDrop: any;
  colors: any;
  dropTitle: string;
  fare: number;
  keepSearching: any;
  params: any;
  pickupTitle: string;
  selectCancelReason: any;
  selectedCancelReason: any;
  setCancelReasonVisible: React.Dispatch<React.SetStateAction<any>>;
  setTripDetailsVisible: React.Dispatch<React.SetStateAction<any>>;
  showCancelReasons: any;
  styles: RideSearchingStyles;
}

export function BookAgainOverlay(props: Props) {
  const { CANCEL_REASONS, cancelConfirmVisible, cancelLocationAddress, cancelLocationLabel, cancelLocationTitle, cancelReasonVisible, cancelRide, cancelUsesDrop, colors, keepSearching, selectCancelReason, selectedCancelReason, setCancelReasonVisible, setTripDetailsVisible, styles } = props;
  const { t } = useTranslation();
  return (
    <View style={styles.bookAgainOverlay}>
      <TouchableOpacity
        style={styles.bookAgainBackdrop}
        activeOpacity={1}
        onPress={() => setTripDetailsVisible(false)}
      />
      <BookAgainOverlayBike {...props} />

      {cancelReasonVisible && (
        <View style={styles.cancelFlowOverlay}>
          <TouchableOpacity
            style={styles.cancelFlowBackdrop}
            activeOpacity={1}
            onPress={() => setCancelReasonVisible(false)}
          />
          <TouchableOpacity
            style={styles.cancelFlowBackButton}
            onPress={() => setCancelReasonVisible(false)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.cancelReasonSheet}>
            <View style={styles.cancelSheetHandle} />
            <Text style={styles.cancelReasonTitle}>{t("app.ride.whyDoYouWantToCancel")}</Text>
            <Text style={styles.cancelReasonSubtitle}>
              {t("app.ride.pleaseProvideTheReasonForCancellation")}
            </Text>
            <View style={styles.cancelReasonDivider} />

            {CANCEL_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.cancelReasonRow}
                onPress={() => selectCancelReason(reason)}
              >
                <Text style={styles.cancelReasonText}>{reason}</Text>
                <Ionicons name="chevron-forward" size={22} color={colors.text} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {cancelConfirmVisible && (
        <View style={styles.cancelFlowOverlay}>
          <TouchableOpacity
            style={styles.cancelFlowBackdrop}
            activeOpacity={1}
            onPress={keepSearching}
          />

          <TouchableOpacity style={styles.cancelConfirmClose} onPress={keepSearching}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.cancelConfirmSheet}>
            <View style={styles.cancelSheetHandle} />
            <Text style={styles.cancelConfirmTitle}>
              {t("app.ride.areYouSureYouWantTo")}{"\n"}{t("app.ride.thisRide")}
            </Text>
            <View style={styles.cancelReasonDivider} />

            <Text style={styles.cancelConfirmCopy}>
              {cancelUsesDrop
                ? t("app.ride.dropLocationCanBeChangedBefore")
                : t("app.ride.pickupLocationCanBeChangedUp")}
            </Text>

            <View style={styles.selectedReasonBox}>
              <Text style={styles.selectedReasonLabel}>{t("app.ride.reason")}</Text>
              <Text style={styles.selectedReasonText}>{selectedCancelReason}</Text>
            </View>

            <Text style={styles.currentAddressLabel}>
              {t("app.ride.yourCurrentAddressIs", { label: cancelLocationLabel, defaultValue: "Your current {{label}} address is" })}
            </Text>
            <View style={styles.cancelAddressRow}>
              <View style={styles.cancelAddressDot} />
              <View style={styles.cancelAddressTextGroup}>
                <Text style={styles.cancelAddressTitle} numberOfLines={1}>
                  {cancelLocationTitle}
                </Text>
                <Text style={styles.cancelAddressDetail} numberOfLines={1}>
                  {cancelLocationAddress}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.cancelMyRideButton} onPress={cancelRide}>
              <Text style={styles.cancelMyRideText}>{t("app.ride.cancelMyRide")}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.keepSearchingButton} onPress={keepSearching}>
              <Text style={styles.keepSearchingText}>{t("app.ride.keepSearching")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
