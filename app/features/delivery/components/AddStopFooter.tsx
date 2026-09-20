import { Text, TouchableOpacity, View } from "react-native";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type AddStopStyles } from "@/features/delivery/add-stop.styles";
import type { PriceBreakdown } from "@/contexts/delivery.types";

// Moved out of app/delivery/add-stop.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  address: any;
  handleAddStop: () => void;
  insets: EdgeInsets;
  isPreviewing: boolean;
  items: any;
  previewDelta: any;
  price: PriceBreakdown | null;
  route: any;
  styles: AddStopStyles;
}

export function AddStopFooter({
  address,
  handleAddStop,
  insets,
  isPreviewing,
  items,
  previewDelta,
  price,
  route,
  styles,
}: Props) {
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      {address && (isPreviewing || previewDelta) && (
        <View style={styles.previewBanner}>
          {isPreviewing ? (
            <Text style={styles.previewBannerText}>Calculating the fare impact of this stop…</Text>
          ) : previewDelta ? (
            <Text style={styles.previewBannerText}>
              Adding this stop: <Text style={styles.previewBannerBold}>{previewDelta.distanceKm >= 0 ? "+" : ""}{previewDelta.distanceKm} km</Text>, delivery goes ₹{price?.total ?? "—"} → ₹{previewDelta.newTotal}.
            </Text>
          ) : null}
        </View>
      )}
      <TouchableOpacity style={[styles.addBtn, (!address || items.length === 0) && { opacity: 0.5 }]} onPress={handleAddStop} disabled={!address || items.length === 0}>
        <Text style={styles.addBtnText}>Add stop to route</Text>
      </TouchableOpacity>
    </View>
  );
}
