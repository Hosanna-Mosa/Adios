import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { ServiceTokens } from "@/constants/colors";
import type { PackageDeliveryVehicle } from "@/contexts/packageDeliveryStore";
import type { PackageDeliveryConfirmStyles } from "../packageDeliveryConfirm.styles";
import type { FareEstimate } from "../usePackageDeliveryTrip";
import { PACKAGE_DELIVERY_VEHICLES } from "../packageDelivery.utils";

// Package delivery by Bike / by Auto, each with its fare, how far the nearest captain is,
// and when the package would be dropped.

interface Props {
  vehicle: PackageDeliveryVehicle;
  fares: Partial<Record<PackageDeliveryVehicle, FareEstimate | null>>;
  loadingFares: boolean;
  pickupEta: (vehicle: PackageDeliveryVehicle) => number | null;
  styles: PackageDeliveryConfirmStyles;
  accent: ServiceTokens;
  onSelect: (vehicle: PackageDeliveryVehicle) => void;
}

const clockAt = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();

export function PackageDeliveryVehicleOptions({ vehicle, fares, loadingFares, pickupEta, styles, accent, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <>
      {PACKAGE_DELIVERY_VEHICLES.map((option) => {
        const on = option.id === vehicle;
        const fare = fares[option.id];
        const eta = pickupEta(option.id);
        const meta = eta == null
          ? t("app.packageDelivery.noCaptains")
          : fare
            ? t("app.packageDelivery.etaWithDrop", { minutes: eta, time: clockAt(eta + fare.estimatedMinutes) })
            : t("app.packageDelivery.eta", { minutes: eta });
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.vehicleRow, on && styles.vehicleRowOn]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
          >
            <Image source={option.image} style={styles.vehicleImage} resizeMode="contain" />
            <View style={styles.vehicleBody}>
              <Text style={styles.vehicleName}>{t(option.nameKey)}</Text>
              <Text style={styles.vehicleHint} numberOfLines={1}>{t(option.hintKey)}</Text>
              <Text style={[styles.vehicleMeta, eta == null && styles.vehicleMetaWarn]} numberOfLines={1}>{meta}</Text>
            </View>
            {loadingFares && !fare ? (
              <ActivityIndicator size="small" color={accent.accent} />
            ) : (
              <Text style={styles.vehiclePrice}>{fare ? `₹${Math.round(fare.fareBreakdown.total)}` : "—"}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </>
  );
}
