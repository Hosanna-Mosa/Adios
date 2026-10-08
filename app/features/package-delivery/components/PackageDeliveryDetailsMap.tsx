import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import MapView, { Marker, PROVIDER_GOOGLE } from "@/components/maps";
import { RIDE_STOP_ANCHOR, rideStopMarker } from "@/components/mapBackground.utils";
import type { ThemeTokens } from "@/constants/colors";
import type { PackageDeliveryPointKind } from "@/contexts/packageDeliveryStore";
import type { PackageDeliveryDetailsStyles } from "../packageDeliveryDetails.styles";

// A still map of the chosen place, so the customer can see the pin is where they meant.

interface Props {
  kind: PackageDeliveryPointKind;
  lat: number;
  lng: number;
  styles: PackageDeliveryDetailsStyles;
  tokens: ThemeTokens;
  onBack: () => void;
}

export function PackageDeliveryDetailsMap({ kind, lat, lng, styles, tokens, onBack }: Props) {
  const { t } = useTranslation();
  const valid = Number.isFinite(lat) && Number.isFinite(lng);
  return (
    <View style={styles.mapWrap}>
      {valid && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          // Nudged north so the pin sits above the sheet that overlaps the map's bottom edge.
          initialRegion={{ latitude: lat - 0.0012, longitude: lng, latitudeDelta: 0.008, longitudeDelta: 0.008 }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          showsPointsOfInterest={false}
        >
          <Marker coordinate={{ latitude: lat, longitude: lng }} image={rideStopMarker(kind)} anchor={RIDE_STOP_ANCHOR} />
        </MapView>
      )}
      <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityRole="button" accessibilityLabel={t("app.packageDelivery.back")}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
    </View>
  );
}
