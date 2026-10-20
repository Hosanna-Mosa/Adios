import React from "react";
import { useTranslation } from "react-i18next";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "./IncomingOrderModal.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/**
 * The offer's distances, labelled: how far the pickup is from the driver (with a rough
 * ETA), then the trip itself (pickup → drop). They used to be three unlabelled chips —
 * trip distance, the order's search radius and trip time — read as the pickup distance
 * and ETA, which made them look wrong.
 */
export function OfferMetrics({
  approach,
  tripDistance,
  tripDuration,
}: {
  approach?: { km: number; minutes: number } | null;
  tripDistance?: string | null;
  tripDuration?: string | null;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.detailsContainer}>
      <Box style={styles.detailRow}>
        <Ionicons name="navigate-outline" size={19} color={Colors.textSecondary} />
        <AppText style={styles.detailText}>
          {approach
            ? t("jobs.toPickupDistance", { km: approach.km, minutes: approach.minutes })
            : `${t("jobs.toPickup")}: ${t("jobs.notAvailableAbbr")}`}
        </AppText>
      </Box>
      <Box style={styles.detailRow}>
        <Ionicons name="location-outline" size={19} color={Colors.textSecondary} />
        <AppText style={styles.detailText}>
          {t("jobs.tripDistance", { distance: tripDistance || t("jobs.notAvailableAbbr"), duration: tripDuration || t("jobs.notAvailableAbbr") })}
        </AppText>
      </Box>
    </Box>
  );
}

/** Pickup and drop stops on an incoming offer. `pickupLabel` names an unnamed pickup ("Restaurant" / "Meat shop"). */
export function OfferRoute({ stops, pickupLabel }: { stops?: any[]; pickupLabel?: string }) {
  const { t } = useTranslation();
  return (
    <Box style={styles.infoSection}>
      <AppText style={styles.sectionTitle}>{t("jobs.route")}</AppText>
      {stops?.map((stop, index) => (
        <Box key={`${stop.id || stop.address}-${index}`} style={styles.stopRow}>
          <MaterialIcons
            name={stop.type === "pickup" ? "my-location" : "location-on"}
            size={20}
            color={stop.type === "pickup" ? Colors.success : Colors.error}
          />
          <Box style={{ flex: 1, marginLeft: 8 }}>
            <AppText style={styles.stopLocationName}>
              {stop.locationName || (stop.type === "pickup" ? pickupLabel || t("jobs.restaurant") : t("jobs.customer"))}
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

/** Helper offers: what the customer wants done, in their words. */
export function OfferTask({ description }: { description?: string | null }) {
  const { t } = useTranslation();
  return (
    <Box style={styles.infoSection}>
      <AppText style={styles.sectionTitle}>{t("jobs.taskDetails")}</AppText>
      <Box style={styles.itemsRestaurantBlock}>
        <AppText style={styles.itemRowText}>
          {description?.trim() || t("jobs.noTaskDescription")}
        </AppText>
      </Box>
    </Box>
  );
}

/** What the driver collects from the restaurant. */
export function OfferItems({
  vendorName,
  items,
  outletLabel,
}: {
  vendorName?: string | null;
  items: any[];
  /** Shown when the outlet's name is missing ("Restaurant" / "Meat shop"). */
  outletLabel?: string;
}) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  return (
    <Box style={styles.infoSection}>
      <AppText style={styles.sectionTitle}>{t("jobs.itemsToPickUp")}</AppText>
      <Box style={styles.itemsRestaurantBlock}>
        <AppText style={styles.itemsRestaurantName}>{vendorName || outletLabel || t("jobs.restaurant")}</AppText>
        {items.map((item: any, idx: number) => (
          <AppText key={idx} style={styles.itemRowText}>
            • {item.quantity}x {item.name}
          </AppText>
        ))}
      </Box>
    </Box>
  );
}

/** How the job is paid for: already paid online, or cash the driver must collect. */
export function OfferPaymentMode({ label, isCash }: { label: string; isCash?: boolean }) {
  const { t } = useTranslation();
  return (
    <Box style={styles.infoSection}>
      <AppText style={styles.sectionTitle}>{t("jobs.paymentMethod")}</AppText>
      <Box style={styles.paymentRow}>
        <Ionicons
          name={isCash ? "cash-outline" : "card-outline"}
          size={18}
          color={isCash ? Colors.warning : Colors.success}
        />
        <AppText style={styles.paymentText}>{label}</AppText>
      </Box>
    </Box>
  );
}
