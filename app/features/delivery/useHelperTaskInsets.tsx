import { useState, useMemo, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./helper-task.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { Step } from "./useHelperTask.shared";
import { useHelperTaskQuote } from "./useHelperTaskQuote";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHelperTaskInsets() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.task;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);
  const driver = useDeliveryStore((s) => s.driver);
  const setOrderId = useDeliveryStore((s) => s.setOrderId);
  const setDriver = useDeliveryStore((s) => s.setDriver);
  const setServiceType = useDeliveryStore((s) => s.setServiceType);
  const setStatus = useDeliveryStore((s) => s.setStatus);

  const [step, setStep] = useState<Step>("compose");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeField, setActiveField] = useState<"pickup" | "dropoff" | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isPickupValid, setIsPickupValid] = useState(false);
  const [isDropoffValid, setIsDropoffValid] = useState(false);

  const [durationMode, setDurationMode] = useState<"1hr" | "2hr" | "custom">("1hr");
  const [customHours, setCustomHours] = useState(2);
  const [customMinutes, setCustomMinutes] = useState(30);

  const [description, setDescription] = useState("");
  const [offer, setOffer] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [localOrderId, setLocalOrderId] = useState<string | null>(null);
  // How the task was paid: an online-paid task raises its price with a top-up payment.
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<"cash" | "online" | null>(null);
  const [isIncreasingPrice, setIsIncreasingPrice] = useState<number | null>(null);
  const [currentTaskPrice, setCurrentTaskPrice] = useState<number | null>(null);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [totalContacted, setTotalContacted] = useState(0);
  const [startOtp, setStartOtp] = useState<string | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<any>(null);
  // Mirrors the order's searchExhaustedAt: every helper offered has passed, and the
  // server cancels the task after a while unless the price is raised.
  const [searchExhausted, setSearchExhausted] = useState(false);
  const [searchStartedAt, setSearchStartedAt] = useState<number | null>(null);
  // Opened with ?orderId= (resume): the order is loading and no step is known yet.
  const [isResuming, setIsResuming] = useState(false);

  const totalHours = durationMode === "1hr" ? 1 : durationMode === "2hr" ? 2 : customHours + customMinutes / 60 || 1;

  // The drop-off only counts once a place was picked — the same rule createTask uses.
  const { quote, isQuoting, quoteError } = useHelperTaskQuote(pickupCoords, isDropoffValid ? dropoffCoords : null, totalHours);
  const calculatedFare = quote?.total ?? 0;

  // A new quote (different place or hours) resets the offer to its total, so an
  // offer picked for the old inputs can't carry over outside the new range.
  useEffect(() => {
    setOffer(null);
  }, [quote?.total, quote?.minOffer, quote?.maxOffer]);

  // Back to an empty search after the task ended (cancelled here or by the server).
  // The form keeps what was typed, so posting it again is one tap away.
  const clearTask = useCallback(() => {
    setStep("compose");
    setSearchExhausted(false);
    setAssignedDriver(null);
    setLocalOrderId(null);
    setOrderPaymentMethod(null);
    setCurrentTaskPrice(null);
    setStartOtp(null);
    setRejectedCount(0);
    setTotalContacted(0);
    setOrderId(null);
  }, [setOrderId]);

  return { clearTask, insets, tokens, accent, styles, driver, setOrderId, setDriver, setServiceType, setStatus, step, setStep, pickupLocation, setPickupLocation, dropoffLocation, setDropoffLocation, pickupCoords, setPickupCoords, dropoffCoords, setDropoffCoords, activeField, setActiveField, searchResults, setSearchResults, isPickupValid, setIsPickupValid, isDropoffValid, setIsDropoffValid, durationMode, setDurationMode, customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription, offer, setOffer, isCreating, setIsCreating, localOrderId, setLocalOrderId, orderPaymentMethod, setOrderPaymentMethod, isIncreasingPrice, setIsIncreasingPrice, currentTaskPrice, setCurrentTaskPrice, rejectedCount, setRejectedCount, totalContacted, setTotalContacted, startOtp, setStartOtp, assignedDriver, setAssignedDriver, searchExhausted, setSearchExhausted, searchStartedAt, setSearchStartedAt, isResuming, setIsResuming, totalHours, quote, isQuoting, quoteError, calculatedFare };
}
