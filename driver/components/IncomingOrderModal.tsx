import React, { useEffect } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";

import { useDriverStore } from "@/store/driverStore";
import { Colors, elevation, radius } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { SPRING, staggerListItem } from "@/motion/presets";

const { height } = Dimensions.get("window");

export default function IncomingOrderModal() {
  const insets = useSafeAreaInsets();
  const { incomingOrder, acceptOrder, rejectOrder } = useDriverStore();
  const slideAnim = useSharedValue(height);
  const sheetAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: slideAnim.value }] }));
  const timerWidth = useSharedValue(100);
  const timerBarAnimatedStyle = useAnimatedStyle(() => ({ width: `${timerWidth.value}%` }));
  const [secondsLeft, setSecondsLeft] = React.useState(15);
  const [showDeclineReasons, setShowDeclineReasons] = React.useState(false);
  const [sound, setSound] = React.useState<Audio.Sound>();

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/notification.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (e) {
      console.warn("Could not play sound", e);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (incomingOrder) {
      playSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const totalSeconds = incomingOrder.isReserved ? 60 : 15;
      setSecondsLeft(totalSeconds);
      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowDeclineReasons(false);
            rejectOrder();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      slideAnim.value = withSpring(0, SPRING);

      return () => clearInterval(timer);
    }
  }, [incomingOrder, slideAnim, rejectOrder]);

  useEffect(() => {
    if (!incomingOrder) return;
    const total = incomingOrder.isReserved ? 60 : 15;
    timerWidth.value = withTiming((secondsLeft / total) * 100, { duration: 320 });
  }, [secondsLeft, incomingOrder, timerWidth]);

  if (!incomingOrder) return null;

  const isHelper = incomingOrder.serviceType?.toLowerCase() === "helper";
  const isRide = ["bike", "auto", "cab", "cab_prime"].includes(incomingOrder.serviceType?.toLowerCase() || "");

  const getFoodItems = () => {
    if (!incomingOrder?.stops) return [];
    for (const stop of incomingOrder.stops) {
      const items = stop.items;
      if (!items) continue;

      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      if (items && typeof items === "object" && (items as any).lines && Array.isArray((items as any).lines) && (items as any).lines.length > 0) {
        return (items as any).lines;
      }
    }
    return [];
  };

  const foodItems = getFoodItems();

  let modalTitle = "New Request!";
  if (incomingOrder.isReserved) {
    modalTitle = "New Reserved Ride!";
  } else if (isRide) {
    modalTitle = "New Ride Request!";
  } else if (isHelper) {
    modalTitle = "New Helper!";
  } else {
    modalTitle = "New Delivery Request!";
  }

  const formattedDate = incomingOrder.reservedAt ? new Date(incomingOrder.reservedAt).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : "N/A";

  return (
    <Modal statusBarTranslucent visible transparent animationType="none" onRequestClose={() => rejectOrder()}>
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingTop: Math.max(insets.top, 16) + 20,
              paddingBottom: Math.max(insets.bottom, 16) + 12,
            },
            sheetAnimatedStyle,
          ]}
        >

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{modalTitle}</Text>
              {incomingOrder.isReserved ? (
                <Text style={[styles.subtitle, { color: Colors.brand, fontWeight: "700" }]}>
                  Scheduled: {formattedDate}
                </Text>
              ) : (
                isHelper && <Text style={styles.subtitle}>Hours Book / Task Specialist</Text>
              )}
            </View>
            <Text style={styles.earnings}>₹{incomingOrder.earnings || "0"}</Text>
          </View>

          {/* Response Timer Bar */}
          <View style={styles.timerContainer}>
            <View style={styles.timerBarBg}>
              <Animated.View style={[styles.timerBar, timerBarAnimatedStyle]} />
            </View>
            <Text style={styles.timerText}>Decline auto-triggers in {secondsLeft} seconds</Text>
          </View>

          {showDeclineReasons ? (
            <View style={{ paddingVertical: 10, paddingBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 }}>Why are you declining?</Text>
              {["Fare is too low", "Distance is too long", "Pickup is too far", "Not interested right now"].map((reason, idx) => (
                <Animated.View key={reason} entering={staggerListItem(idx)}>
                  <TouchableOpacity
                    style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => {
                      setShowDeclineReasons(false);
                      rejectOrder(reason);
                    }}
                  >
                    <Text style={{ fontSize: 16, color: Colors.textSecondary, flex: 1 }}>{reason}</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
              <TouchableOpacity
                style={{ marginTop: 24, paddingVertical: 14, backgroundColor: Colors.surfaceContainer, borderRadius: radius.md, alignItems: 'center' }}
                onPress={() => setShowDeclineReasons(false)}
              >
                <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textSecondary }}>Back to Order</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
              >
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={19} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{incomingOrder.distance || "N/A"}</Text>
              </View>
              {incomingOrder.radius !== undefined && (
                <View style={styles.detailRow}>
                  <Ionicons name="navigate-outline" size={19} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>{incomingOrder.radius} km</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={19} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{incomingOrder.duration || "N/A"}</Text>
              </View>
            </View>

            {/* Route Details */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>ROUTE</Text>
              {incomingOrder.stops?.map((stop, index) => (
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

            {/* Items Checklist Display */}
            {!isHelper && !isRide && foodItems.length > 0 && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>ITEMS TO PICK UP</Text>
                <View style={styles.itemsRestaurantBlock}>
                  <Text style={styles.itemsRestaurantName}>
                    {incomingOrder.vendorName || "Restaurant"}
                  </Text>
                  {foodItems.map((item: any, idx: number) => (
                    <Text key={idx} style={styles.itemRowText}>
                      • {item.quantity}x {item.name}
                    </Text>
                  ))}
                </View>
              </View>
            )}

          </ScrollView>

          <View style={styles.actionButtons}>
              <Button
                title="Decline"
                variant="secondary"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowDeclineReasons(true);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Accept Order"
                variant="primary"
                style={{ flex: 1 }}
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  const isReserved = incomingOrder.isReserved;
                  await acceptOrder();
                  if (!isReserved) {
                    if (isHelper) {
                      router.push({ pathname: "/chat", params: { orderId: incomingOrder.id } });
                    } else {
                      router.push("/active-order");
                    }
                  }
                }}
              />
            </View>
          </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    ...elevation.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  earnings: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.success,
  },
  timerContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  timerBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  timerBar: {
    height: "100%",
    backgroundColor: Colors.error,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.error,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 16,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.surfaceContainer,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  stopLocationName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  stopAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  itemsRestaurantBlock: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  itemsRestaurantName: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  itemRowText: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingLeft: 4,
    paddingVertical: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});
