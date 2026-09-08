import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp, modalSlideUp, staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { StopCard } from "@/components/StopCard";

// Moved out of app/delivery/entry.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  currentLocation: any;
  handleRecenter: any;
  handleReview: any;
  handleStopPress: any;
  insets: any;
  isCalculating: any;
  isLocating: any;
  price: any;
  removeStop: any;
  route: any;
  stops: any[];
  styles: any;
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
  return (
    <Animated.View style={styles.sheet} entering={modalSlideUp}>
      <View style={styles.sheetHandle} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <Animated.View entering={fadeInUp(60)}>
          <Text style={styles.headline}>Create multi-stop{"\n"}delivery</Text>
          <Text style={styles.subhead}>Pick up from several places on one run. We&apos;ll pay at the store and you settle here.</Text>
        </Animated.View>

        <Animated.View entering={fadeInUp(120)}>
          <TouchableOpacity style={styles.startCard} activeOpacity={0.85} onPress={handleRecenter}>
            <View style={styles.startIcon}>
              {isLocating ? <ActivityIndicator size="small" color={accent.accent} /> : <Ionicons name="locate" size={moderateScale(17)} color={accent.accent} />}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.startLabel}>Starting from</Text>
              <Text style={styles.startValue} numberOfLines={1}>{currentLocation}</Text>
            </View>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={styles.routeSection} entering={fadeInUp(180)}>
          <Text style={styles.sectionLabel}>Route · {stops.length} {stops.length === 1 ? "stop" : "stops"}</Text>
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
            <Text style={styles.addStopBtnText}>+ Add pickup location</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
        {stops.length > 0 && (
          <View style={styles.footerRow}>
            {isCalculating ? (
              <Text style={styles.footerMeta}>Calculating route…</Text>
            ) : route ? (
              <Text style={styles.footerMeta}>{route.totalDistance} km · about {route.estimatedTime} min</Text>
            ) : (
              <Text style={styles.footerMeta}>Add a pickup to see distance</Text>
            )}
            {price != null && <Text style={styles.footerPrice}>₹{price.total} delivery</Text>}
          </View>
        )}
        <TouchableOpacity
          style={[styles.reviewBtn, (stops.length === 0 || isCalculating) && { opacity: 0.5 }]}
          disabled={stops.length === 0 || isCalculating}
          onPress={handleReview}
        >
          <Text style={styles.reviewBtnText}>Review route</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
