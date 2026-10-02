import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import AppMapView from "@/components/AppMapView";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type MapPickerStyles } from "@/features/delivery/useMapPicker.shared";

// Moved out of app/map-picker.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  LIGHT_GREEN_MAP_STYLE: any;
  handleRegionChangeComplete: any;
  handleUseCurrentLocation: () => void;
  insets: EdgeInsets;
  mapRef: any;
  recentering: any;
  region: any;
  styles: MapPickerStyles;
  tokens: ThemeTokens;
}

export function MapPickerMapContainer({
  LIGHT_GREEN_MAP_STYLE,
  handleRegionChangeComplete,
  handleUseCurrentLocation,
  insets,
  mapRef,
  recentering,
  region,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.mapContainer}>
      <AppMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        customMapStyle={LIGHT_GREEN_MAP_STYLE}
      />

      <Animated.View entering={fadeIn(150)} style={styles.centerMarkerContainer} pointerEvents="none">
        <View style={styles.dragHint}>
          <Text style={styles.dragHintText}>{t("app.delivery.dragToAdjust")}</Text>
        </View>
        <View style={styles.dragHintStem} />
        <View style={styles.pinWrapper}>
          <View style={styles.pinHead}>
            <View style={styles.pinDot} />
          </View>
          <View style={styles.pinStem} />
          <View style={styles.pinShadow} />
        </View>
      </Animated.View>

      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.recenterBtn} onPress={handleUseCurrentLocation} disabled={recentering}>
        {recentering ? (
          <ActivityIndicator size="small" color={tokens.text} />
        ) : (
          <MaterialCommunityIcons name="crosshairs-gps" size={moderateScale(19)} color={tokens.text} />
        )}
      </TouchableOpacity>
    </View>
  );
}
