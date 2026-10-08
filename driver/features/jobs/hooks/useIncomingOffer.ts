import * as React from "react";
import { useEffect } from "react";
import { Dimensions } from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useDriverStore } from "@/store/driverStore";
import { SPRING } from "@/motion/presets";
import type { Order } from "@/store/types";

const { height } = Dimensions.get("window");

const DEFAULT_OFFER_SECONDS = 25;

/** When this offer runs out on the device clock. `secondsLeft` (relative, so
 * immune to clock skew) wins over `expiresAt`; else the full offer window. */
function offerDeadline(order: Order): { deadline: number; total: number } {
  const total = order.offerTimeoutSeconds || DEFAULT_OFFER_SECONDS;
  if (typeof order.secondsLeft === "number" && order.secondsLeft >= 0) {
    return { deadline: Date.now() + order.secondsLeft * 1000, total };
  }
  const expires = order.expiresAt ? new Date(order.expiresAt).getTime() : NaN;
  if (Number.isFinite(expires)) return { deadline: expires, total };
  return { deadline: Date.now() + total * 1000, total };
}

const secondsUntil = (deadline: number) => Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

/** Countdown, alert sound and sheet animation for an incoming order offer.
 *
 * The countdown follows the offer's `expiresAt`/`secondsLeft` from the server
 * (else offerTimeoutSeconds, else 25); when it runs out the offer is rejected
 * automatically. Food offers (dispatchMode "broadcast") have no countdown:
 * they go to every nearby rider and stay open until one accepts. */
export function useIncomingOffer() {
  const { incomingOrder, rejectOrder } = useDriverStore();
  const isBroadcast = incomingOrder?.dispatchMode === "broadcast";

  const slideAnim = useSharedValue(height);
  const sheetAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: slideAnim.value }] }));
  const timerWidth = useSharedValue(100);
  const timerBarAnimatedStyle = useAnimatedStyle(() => ({ width: `${timerWidth.value}%` }));
  const [secondsLeft, setSecondsLeft] = React.useState(DEFAULT_OFFER_SECONDS);
  const totalSeconds = React.useRef(DEFAULT_OFFER_SECONDS);
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
      const { deadline, total } = offerDeadline(incomingOrder);
      const left = secondsUntil(deadline);
      totalSeconds.current = Math.max(total, left, 1);
      setSecondsLeft(left);
      const timer = setInterval(() => {
        const remaining = secondsUntil(deadline);
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          setShowDeclineReasons(false);
          rejectOrder(undefined, { timedOut: true });
        }
      }, 1000);

      slideAnim.value = withSpring(0, SPRING);

      return () => clearInterval(timer);
    }
  }, [incomingOrder, slideAnim, rejectOrder]);

  useEffect(() => {
    if (!incomingOrder || incomingOrder.dispatchMode === "broadcast") return;
    timerWidth.value = withTiming((secondsLeft / totalSeconds.current) * 100, { duration: 320 });
  }, [secondsLeft, incomingOrder, timerWidth]);

  return { isBroadcast, secondsLeft, showDeclineReasons, setShowDeclineReasons, sheetAnimatedStyle, timerBarAnimatedStyle };
}
