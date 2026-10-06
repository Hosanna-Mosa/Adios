import * as React from "react";
import { useEffect } from "react";
import { Dimensions } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useDriverStore } from "@/store/driverStore";
import { SPRING } from "@/motion/presets";

const { height } = Dimensions.get("window");

/** Countdown, alert sound and sheet animation for an incoming order offer.
 *
 * Reserved rides get 60 seconds, everything else 15; when it runs out the
 * offer is rejected automatically. Food offers (dispatchMode "broadcast") have
 * no countdown: they go to every nearby rider and stay open until one accepts. */
export function useIncomingOffer() {
  const { incomingOrder, rejectOrder } = useDriverStore();
  const isBroadcast = incomingOrder?.dispatchMode === "broadcast";

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
    if (incomingOrder && incomingOrder.dispatchMode === "broadcast") {
      playSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      slideAnim.value = withSpring(0, SPRING);
      return;
    }
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
    if (!incomingOrder || incomingOrder.dispatchMode === "broadcast") return;
    const total = incomingOrder.isReserved ? 60 : 15;
    timerWidth.value = withTiming((secondsLeft / total) * 100, { duration: 320 });
  }, [secondsLeft, incomingOrder, timerWidth]);

  return { isBroadcast, secondsLeft, showDeclineReasons, setShowDeclineReasons, sheetAnimatedStyle, timerBarAnimatedStyle };
}
