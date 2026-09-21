import { useState, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStyles } from "./helper-task.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { Step, getDistanceFromLatLonInKm } from "./useHelperTask.shared";

// Split out of useHelperTask so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useHelperTaskInsets() {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services.task;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);
  const { radius } = useLocalSearchParams<{ radius?: string }>();
  const driver = useDeliveryStore((s) => s.driver);
  const currentCoords = useDeliveryStore((s) => s.currentCoords);
  const currentLocation = useDeliveryStore((s) => s.currentLocation);
  const setOrderId = useDeliveryStore((s) => s.setOrderId);
  const setDriver = useDeliveryStore((s) => s.setDriver);
  const setServiceType = useDeliveryStore((s) => s.setServiceType);

  const [step, setStep] = useState<Step>("compose");
  const [taskType, setTaskType] = useState<string | null>(null);
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
  const [isIncreasingPrice, setIsIncreasingPrice] = useState<number | null>(null);
  const [currentTaskPrice, setCurrentTaskPrice] = useState<number | null>(null);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [totalContacted, setTotalContacted] = useState(0);
  const [startOtp, setStartOtp] = useState<string | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<any>(null);

  const totalHours = durationMode === "1hr" ? 1 : durationMode === "2hr" ? 2 : customHours + customMinutes / 60 || 1;

  // Same client-computed formula as before this pass — flagged, not
  // changed, in the review notes: the backend trusts totals.total verbatim
  // for helper orders with no server-side recalculation.
  const calculatedFare = useMemo(() => {
    if (!pickupCoords) return 0;
    const baseFare = 40;
    const platformFee = 5;
    let distanceCharge = 0;
    if (dropoffCoords) {
      const distanceKm = getDistanceFromLatLonInKm(pickupCoords.lat, pickupCoords.lng, dropoffCoords.lat, dropoffCoords.lng);
      distanceCharge = Math.round(Math.max(0, distanceKm - 2) * 15);
    }
    const durationCharge = Math.round(totalHours * 80);
    const subtotal = baseFare + distanceCharge + durationCharge + platformFee;
    return subtotal + Math.round(subtotal * 0.05);
  }, [pickupCoords, dropoffCoords, totalHours]);

  return { insets, tokens, accent, styles, radius, driver, currentCoords, setOrderId, setDriver, setServiceType, step, setStep, taskType, setTaskType, pickupLocation, setPickupLocation, dropoffLocation, setDropoffLocation, pickupCoords, setPickupCoords, dropoffCoords, setDropoffCoords, activeField, setActiveField, searchResults, setSearchResults, isPickupValid, setIsPickupValid, isDropoffValid, setIsDropoffValid, durationMode, setDurationMode, customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription, offer, setOffer, isCreating, setIsCreating, localOrderId, setLocalOrderId, isIncreasingPrice, setIsIncreasingPrice, currentTaskPrice, setCurrentTaskPrice, rejectedCount, setRejectedCount, totalContacted, setTotalContacted, startOtp, setStartOtp, assignedDriver, setAssignedDriver, totalHours, calculatedFare };
}
