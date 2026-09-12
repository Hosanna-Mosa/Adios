import React from "react";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "./IncomingOrderModal.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
    <Box style={styles.detailsContainer}>
      <Box style={styles.detailRow}>
        <Ionicons name="location-outline" size={19} color={Colors.textSecondary} />
        <AppText style={styles.detailText}>{distance || "N/A"}</AppText>
      </Box>
      {radius !== undefined && (
        <Box style={styles.detailRow}>
          <Ionicons name="navigate-outline" size={19} color={Colors.textSecondary} />
          <AppText style={styles.detailText}>{radius} km</AppText>
        </Box>
      )}
      <Box style={styles.detailRow}>
        <Ionicons name="time-outline" size={19} color={Colors.textSecondary} />
        <AppText style={styles.detailText}>{duration || "N/A"}</AppText>
      </Box>
    </Box>
  );
}

/** Pickup and drop stops on an incoming offer. */
export function OfferRoute({ stops }: { stops?: any[] }) {
  return (
    <Box style={styles.infoSection}>
      <AppText style={styles.sectionTitle}>ROUTE</AppText>
      {stops?.map((stop, index) => (
        <Box key={`${stop.id || stop.address}-${index}`} style={styles.stopRow}>
          <MaterialIcons
            name={stop.type === "pickup" ? "my-location" : "location-on"}
            size={20}
            color={stop.type === "pickup" ? Colors.success : Colors.error}
          />
          <Box style={{ flex: 1, marginLeft: 8 }}>
            <AppText style={styles.stopLocationName}>
              {stop.locationName || (stop.type === "pickup" ? "Restaurant" : "Customer")}
            </AppText>
            <AppText style={styles.stopAddress} numberOfLines={1}>
              {stop.address}
            </AppText>
          </Box>
        </Box>
      ))}
    </Box>
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
    <Box style={styles.infoSection}>
      <AppText style={styles.sectionTitle}>ITEMS TO PICK UP</AppText>
      <Box style={styles.itemsRestaurantBlock}>
        <AppText style={styles.itemsRestaurantName}>{vendorName || "Restaurant"}</AppText>
        {items.map((item: any, idx: number) => (
          <AppText key={idx} style={styles.itemRowText}>
            • {item.quantity}x {item.name}
          </AppText>
        ))}
      </Box>
    </Box>
  );
}

/** How the job is paid for. */
export function OfferPaymentMode({ label }: { label: string }) {
  return (
    <Box style={styles.infoSection}>
      <AppText style={styles.sectionTitle}>PAYMENT METHOD</AppText>
      <Box style={styles.paymentRow}>
        <Ionicons name="card-outline" size={18} color={Colors.success} />
        <AppText style={styles.paymentText}>{label}</AppText>
      </Box>
    </Box>
  );
}
