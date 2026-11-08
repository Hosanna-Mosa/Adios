import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      {address && (isPreviewing || previewDelta) && (
        <View style={styles.previewBanner}>
          {isPreviewing ? (
            <Text style={styles.previewBannerText}>{t("app.delivery.calculatingTheFareImpactOfThis")}</Text>
          ) : previewDelta ? (
            <Text style={styles.previewBannerText}>
              {t("app.delivery.addingThisStop")} <Text style={styles.previewBannerBold}>{previewDelta.distanceKm >= 0 ? "+" : ""}{previewDelta.distanceKm} km</Text>{t("app.delivery.deliveryGoes")}{price?.total ?? "—"} → ₹{previewDelta.newTotal}.
            </Text>
          ) : null}
        </View>
      )}
      <TouchableOpacity style={[styles.addBtn, (!address || items.length === 0) && { opacity: 0.5 }]} onPress={handleAddStop} disabled={!address || items.length === 0}>
        <Text style={styles.addBtnText}>{t("app.delivery.addStopToRoute")}</Text>
      </TouchableOpacity>
    </View>
  );
}
