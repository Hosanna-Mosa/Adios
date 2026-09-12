import React from "react";
import { Text, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "./IncomingOrderModal.styles";

/** Distance, radius and duration chips at the top of an offer. */
export function OfferMetrics({
  distance,
  radius,
  duration,
}: {
  distance?: string | null;
  radius?: number;
  duration?: string | null;
}) {
  return (
    <View style={styles.detailsContainer}>
      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={19} color={Colors.textSecondary} />
        <Text style={styles.detailText}>{distance || "N/A"}</Text>
      </View>
      {radius !== undefined && (
        <View style={styles.detailRow}>
          <Ionicons name="navigate-outline" size={19} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{radius} km</Text>
        </View>
      )}
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={19} color={Colors.textSecondary} />
        <Text style={styles.detailText}>{duration || "N/A"}</Text>
      </View>
    </View>
  );
}

/** Pickup and drop stops on an incoming offer. */
export function OfferRoute({ stops }: { stops?: any[] }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>ROUTE</Text>
      {stops?.map((stop, index) => (
        <View key={`${stop.id || stop.address}-${index}`} style={styles.stopRow}>
          <MaterialIcons
            name={stop.type === "pickup" ? "my-location" : "location-on"}
            size={20}
            color={stop.type === "pickup" ? Colors.success : Colors.error}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.stopLocationName}>
              {stop.locationName || (stop.type === "pickup" ? "Restaurant" : "Customer")}
            </Text>
            <Text style={styles.stopAddress} numberOfLines={1}>
              {stop.address}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** What the driver collects from the restaurant. */
export function OfferItems({
  vendorName,
  items,
}: {
  vendorName?: string | null;
  items: any[];
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>ITEMS TO PICK UP</Text>
      <View style={styles.itemsRestaurantBlock}>
        <Text style={styles.itemsRestaurantName}>{vendorName || "Restaurant"}</Text>
        {items.map((item: any, idx: number) => (
          <Text key={idx} style={styles.itemRowText}>
            • {item.quantity}x {item.name}
          </Text>
        ))}
      </View>
    </View>
  );
}

/** How the job is paid for. */
export function OfferPaymentMode({ label }: { label: string }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
      <View style={styles.paymentRow}>
        <Ionicons name="card-outline" size={18} color={Colors.success} />
        <Text style={styles.paymentText}>{label}</Text>
      </View>
    </View>
  );
}
