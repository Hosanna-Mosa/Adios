import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type PickupConfirmationStyles } from "@/features/ride/pickup-confirmation.styles";

// Moved out of app/pickup-confirmation.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  pickupCoords: any;
  PROVIDER_GOOGLE: any;
  MapView: any;
  accent: ServiceTokens;
  insets: EdgeInsets;
  mapRef: any;
  styles: PickupConfirmationStyles;
  tokens: ThemeTokens;
  useCurrentLocation: any;
}

export function PickupConfirmMapArea({
  pickupCoords,
  PROVIDER_GOOGLE,
  MapView,
  accent,
  insets,
  mapRef,
  styles,
  tokens,
  useCurrentLocation,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.mapArea}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          ...pickupCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation
      />

      <View pointerEvents="none" style={styles.centerMarker}>
        <View style={styles.markerWrap}>
          <View style={styles.pickupBubble}>
            <Text style={styles.pickupBubbleText}>{t("app.ride.pickupPoint")}</Text>
          </View>
          <View style={styles.pin}>
            <Ionicons name="navigate" size={18} color={accent.on} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 16 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={22} color={tokens.text} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.locateButton} onPress={useCurrentLocation}>
        <Ionicons name="locate" size={22} color={accent.accent} />
      </TouchableOpacity>
    </View>
  );
}
