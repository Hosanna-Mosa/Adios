import { OrderReviewCard } from "./OrderReviewCard";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { fontFamilies } from "@/constants/typography";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type TrackingStyles } from "@/features/ride/tracking.styles";

// Moved out of app/tracking.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  subline: any;
  headline: any;
  foodItems: any[];
  accent: ServiceTokens;
  currentOrderId: string | null;
  deliveryStop: any;
  handleBack: () => void;
  insets: EdgeInsets;
  isHelper: boolean;
  isRide: boolean;
  stops: any[];
  styles: TrackingStyles;
  tokens: ThemeTokens;
  totalPrice: number | null;
}

export function TripCompleteScreen({
  subline,
  headline,
  foodItems,
  accent,
  currentOrderId,
  deliveryStop,
  handleBack,
  insets,
  isHelper,
  isRide,
  stops,
  styles,
  tokens,
  totalPrice,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.doneRoot, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.doneHead}>
        <View style={styles.doneCheck}>
          <Ionicons name="checkmark" size={moderateScale(28)} color="#fff" />
        </View>
        <Text style={styles.doneTitle}>{headline}</Text>
        <Text style={styles.doneSubtitle}>{subline}</Text>
        {totalPrice != null && <Text style={styles.donePrice}>₹{Math.round(totalPrice)} paid</Text>}
      </View>

      <ScrollView style={{ flex: 1, width: "100%" }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {isRide ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneCardTitle}>{t("app.ride.route")}</Text>
            <View style={{ gap: 8, paddingVertical: 4 }}>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <View style={[styles.dotSmall, { backgroundColor: tokens.success }]} />
                <Text style={styles.doneAddrText} numberOfLines={2}>{stops?.find((s) => s.type === "pickup")?.address || t("app.ride.pickupLocation")}</Text>
              </View>
              <View style={{ width: 2, height: 12, backgroundColor: tokens.border, marginLeft: 3 }} />
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <View style={[styles.dotSmall, { backgroundColor: tokens.error, borderRadius: 2 }]} />
                <Text style={styles.doneAddrText} numberOfLines={2}>{deliveryStop?.address || t("app.ride.destination")}</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.doneCard}>
              <Text style={styles.doneCardTitle}>{isHelper ? t("app.ride.taskDetails") : t("app.ride.deliveredItems")}</Text>
              {isHelper ? (
                <Text style={styles.doneAddrText}>{t("app.ride.bookedLocation")} {stops?.[0]?.address || "—"}</Text>
              ) : foodItems.length > 0 ? (
                foodItems.map((item: any, idx: number) => (
                  <View key={idx} style={{ flexDirection: "row", gap: 8, paddingVertical: 4 }}>
                    <Text style={[styles.doneAddrText, { fontFamily: fontFamilies.body.bold, color: accent.accent }]}>{item.quantity}x</Text>
                    <Text style={styles.doneAddrText}>{item.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.doneAddrText}>{t("app.ride.itemsSuccessfullyHandedOver")}</Text>
              )}
            </View>
            {deliveryStop?.address && (
              <View style={styles.doneCard}>
                <Text style={styles.doneCardTitle}>{t("app.ride.deliveryAddress")}</Text>
                <Text style={styles.doneAddrText}>{deliveryStop.address}</Text>
              </View>
            )}
          </>
        )}

        <OrderReviewCard orderId={currentOrderId || ""} isRide={isRide} isHelper={isHelper} tokens={tokens} accent={accent} />
        <View style={{ height: 8 }} />
      </ScrollView>

      <View style={{ width: "100%", paddingHorizontal: 20, paddingTop: 8 }}>
        <TouchableOpacity style={[styles.doneHomeBtn, { backgroundColor: accent.accent }]} onPress={handleBack}>
          <Text style={[styles.doneHomeBtnText, { color: accent.on }]}>{t("app.ride.backToOrders")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
