import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
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
  return (
    <Animated.View entering={modalSlideUp} style={styles.bottomPanel}>
      <View style={styles.sheetHandle} />
      <Text style={styles.panelTitle}>Double check {step} point</Text>
      <Text style={styles.panelSub}>
        Move the pin to where you&apos;ll actually stand. Captains cancel most often when the pin is inside a gated community.
      </Text>

      <View style={styles.addressCard}>
        <View style={styles.addressDot} />
        <View style={styles.addressInfo}>
          <Text style={styles.addressMain} numberOfLines={1}>
            {loading ? "Locating…" : address.split(",")[0]}
          </Text>
          <Text style={styles.addressSub} numberOfLines={1}>
            {loading ? "Fetching address details…" : address}
          </Text>
          <Text style={styles.addressCoords} numberOfLines={1}>Lat {latLabel}  ·  Lng {lngLabel}</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={accent.accent} />
        ) : (
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading} activeOpacity={0.9}>
        <Text style={styles.confirmBtnText}>Confirm {step}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
