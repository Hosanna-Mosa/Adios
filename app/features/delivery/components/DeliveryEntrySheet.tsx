import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp, modalSlideUp, staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { StopCard } from "@/components/StopCard";
import { type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type DeliveryEntryStyles } from "@/features/delivery/useDeliveryEntry.shared";
import type { PriceBreakdown } from "@/contexts/delivery.types";

// Moved out of app/delivery/entry.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  currentLocation: any;
  handleRecenter: () => void;
  handleReview: () => void;
  handleStopPress: any;
  insets: EdgeInsets;
  isCalculating: boolean;
  isLocating: boolean;
  price: PriceBreakdown | null;
  removeStop: any;
  route: any;
  stops: any[];
  styles: DeliveryEntryStyles;
}

export function DeliveryEntrySheet({
  accent,
  currentLocation,
  handleRecenter,
  handleReview,
  handleStopPress,
  insets,
  isCalculating,
  isLocating,
  price,
  removeStop,
  route,
  stops,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.sheet} entering={modalSlideUp}>
      <View style={styles.sheetHandle} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <Animated.View entering={fadeInUp(60)}>
          <Text style={styles.headline}>{t("app.delivery.createMultistop")}{"\n"}{t("app.delivery.delivery")}</Text>
          <Text style={styles.subhead}>{t("app.delivery.pickUpFromSeveralPlacesOn")}</Text>
        </Animated.View>

        <Animated.View entering={fadeInUp(120)}>
          <TouchableOpacity style={styles.startCard} activeOpacity={0.85} onPress={handleRecenter}>
            <View style={styles.startIcon}>
              {isLocating ? <ActivityIndicator size="small" color={accent.accent} /> : <Ionicons name="locate" size={moderateScale(17)} color={accent.accent} />}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.startLabel}>{t("app.delivery.startingFrom")}</Text>
              <Text style={styles.startValue} numberOfLines={1}>{currentLocation}</Text>
            </View>
            <Text style={styles.changeLink}>{t("app.delivery.change")}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={styles.routeSection} entering={fadeInUp(180)}>
          <Text style={styles.sectionLabel}>{t("app.delivery.route")} {t("app.delivery.stopCount", { count: stops.length })}</Text>
          {stops.length > 0 && (
            <View style={{ gap: 8, marginBottom: 10 }}>
              {stops.map((stop, i) => (
                <Animated.View key={stop.id} entering={staggerListItem(i)}>
                  <StopCard stop={stop} index={i} onRemove={removeStop} onPress={handleStopPress} />
                </Animated.View>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.addStopBtn} onPress={() => router.push("/delivery/add-stop")} activeOpacity={0.85}>
            <Text style={styles.addStopBtnText}>{t("app.delivery.addPickupLocation")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {stops.length > 0 && (
          <View style={styles.footerRow}>
            {isCalculating ? (
              <Text style={styles.footerMeta}>{t("app.delivery.calculatingRoute")}</Text>
            ) : route ? (
              <Text style={styles.footerMeta}>{route.totalDistance} {t("app.delivery.kmAbout")} {route.estimatedTime} min</Text>
            ) : (
              <Text style={styles.footerMeta}>{t("app.delivery.addAPickupToSeeDistance")}</Text>
            )}
            {price != null && <Text style={styles.footerPrice}>₹{price.total} {t("app.delivery.deliveryLower")}</Text>}
          </View>
        )}
        <TouchableOpacity
          style={[styles.reviewBtn, (stops.length === 0 || isCalculating) && { opacity: 0.5 }]}
          disabled={stops.length === 0 || isCalculating}
          onPress={handleReview}
        >
          <Text style={styles.reviewBtnText}>{t("app.delivery.reviewRoute")}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
