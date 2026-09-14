import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/finding-driver.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  CANCEL_REASONS: any[];
  accent: any;
  cancelReason: any;
  handleCancel: any;
  insets: any;
  setCancelReason: React.Dispatch<React.SetStateAction<any>>;
  setShowCancelSheet: React.Dispatch<React.SetStateAction<any>>;
  showCancelSheet: any;
  styles: any;
}

export function CancelRideSheet({
  CANCEL_REASONS,
  accent,
  cancelReason,
  handleCancel,
  insets,
  setCancelReason,
  setShowCancelSheet,
  showCancelSheet,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Modal visible={showCancelSheet} transparent animationType="slide" onRequestClose={() => setShowCancelSheet(false)}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity activeOpacity={1} style={styles.sheetScrim} onPress={() => setShowCancelSheet(false)} />
        <View style={[styles.cancelSheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.cancelSheetTitle}>{t("app.ride.whyDoYouWantToCancel")}</Text>
          <Text style={styles.cancelSheetSub}>{t("app.ride.noCancellationFeeWeHavenapostAssigned")}</Text>

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
            <TouchableOpacity style={styles.cancelSheetCancelBtn} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.cancelSheetCancelBtnText}>{t("app.ride.cancelMyRide")}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelSheetKeepBtn, { backgroundColor: accent.accent }]} onPress={() => setShowCancelSheet(false)} activeOpacity={0.9}>
              <Text style={[styles.cancelSheetKeepBtnText, { color: accent.on }]}>{t("app.ride.keepSearching")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
