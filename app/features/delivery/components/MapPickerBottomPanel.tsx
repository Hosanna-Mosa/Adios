import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { modalSlideUp } from "@/motion/presets";
import { router } from "expo-router";

// Moved out of app/map-picker.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  address: any;
  handleConfirm: any;
  latLabel: any;
  lngLabel: any;
  loading: any;
  step: any;
  styles: any;
}

export function MapPickerBottomPanel({
  accent,
  address,
  handleConfirm,
  latLabel,
  lngLabel,
  loading,
  step,
  styles,
}: Props) {
  const { t } = useTranslation();
  // `step` is the raw 'pickup' | 'drop' state value (not display text) — the
  // word actually shown is looked up separately so it's never left in
  // English inside an otherwise-translated sentence.
  const stepLabel = step === "pickup" ? t("app.delivery.pickupWord") : t("app.delivery.dropWord");
  return (
    <Animated.View entering={modalSlideUp} style={styles.bottomPanel}>
      <View style={styles.sheetHandle} />
      <Text style={styles.panelTitle}>{t("app.delivery.doubleCheck")} {stepLabel} {t("app.delivery.point")}</Text>
      <Text style={styles.panelSub}>
        {t("app.delivery.moveThePinToWhereYouaposll")}
      </Text>

      <View style={styles.addressCard}>
        <View style={styles.addressDot} />
        <View style={styles.addressInfo}>
          <Text style={styles.addressMain} numberOfLines={1}>
            {loading ? t("app.delivery.locating") : address.split(",")[0]}
          </Text>
          <Text style={styles.addressSub} numberOfLines={1}>
            {loading ? t("app.delivery.fetchingAddressDetails") : address}
          </Text>
          <Text style={styles.addressCoords} numberOfLines={1}>{t("app.delivery.lat")} {latLabel}  {t("app.delivery.lng")} {lngLabel}</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={accent.accent} />
        ) : (
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.editLink}>{t("app.delivery.edit")}</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading} activeOpacity={0.9}>
        <Text style={styles.confirmBtnText}>{t("app.delivery.confirm")} {stepLabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
