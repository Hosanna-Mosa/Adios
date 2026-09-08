import React, { useState, useMemo } from "react";
import { TaskComposeForm } from "@/features/delivery/components/TaskComposeForm";
import { TaskBiddingPanel } from "@/features/delivery/components/TaskBiddingPanel";
import { TaskAssignedPanel } from "@/features/delivery/components/TaskAssignedPanel";
import { View, ScrollView, Alert, Linking } from "react-native";

import { router, useLocalSearchParams, Stack } from "expo-router";
import { customFetch } from "@/utils/api/custom-fetch";
import { socketService } from "@/utils/socketService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Header } from "@/components/ui/Header";
import { createStyles } from "@/features/delivery/helper-task.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import * as Location from "expo-location";
import { fadeIn } from "@/motion/presets";

import { HelperTaskSection } from "@/features/delivery/components/HelperTaskSection";
import { HelperTaskOfferBlock } from "@/features/delivery/components/HelperTaskOfferBlock";

import { ScreenShell } from "@/components/ui/ScreenShell";
import { HelperTaskBody } from "@/features/delivery/components/HelperTaskBody";

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TASK_TYPES = ["Shifting", "Cleaning", "Queue & errands", "Loading"];

type Step = "compose" | "bidding" | "searching" | "assigned";

export default function HelperTaskScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services.task;
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);
  const { radius } = useLocalSearchParams<{ radius?: string }>();
  const { driver, currentCoords, currentLocation, setOrderId, setDriver, setServiceType } = useDeliveryStore();

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

  const suggestedLow = Math.round(calculatedFare * 0.85 / 5) * 5;
  const suggestedHigh = Math.round(calculatedFare * 1.15 / 5) * 5;

  React.useEffect(() => {
    let interval: any;
    if (step === "searching" && localOrderId) {
      const fetchStatus = async () => {
        try {
          const orderData = await customFetch<any>(`/orders/${localOrderId}`);
          if (orderData) {
            setRejectedCount(orderData.declineReasons ? orderData.declineReasons.length : 0);
            setTotalContacted(orderData.totalCandidatesCount || 0);
            if (orderData.customerPrice) setCurrentTaskPrice(orderData.customerPrice);
            else if (orderData.totalPrice) setCurrentTaskPrice(orderData.totalPrice);
            if (orderData.restaurantPickupCode) setStartOtp(orderData.restaurantPickupCode);
            if ((orderData.status === "DRIVER_ASSIGNED" || orderData.status === "accepted") && orderData.driver) {
              setDriver(orderData.driver);
              setAssignedDriver(orderData.driver);
              setStep("assigned");
            }
          }
        } catch (err) {
          console.warn("Error polling order status:", err);
        }
      };
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [step, localOrderId]);

  const handleUseCurrentLocation = async () => {
    try {
      const storeLocation = useDeliveryStore.getState().currentLocation;
      const storeCoords = useDeliveryStore.getState().currentCoords;
      if (storeLocation && storeCoords?.lat && storeCoords?.lng) {
        setPickupLocation(storeLocation);
        setPickupCoords(storeCoords);
        setIsPickupValid(true);
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Please enable location services to find your current location.");
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { lat: location.coords.latitude, lng: location.coords.longitude };
      setPickupCoords(coords);
      const [address] = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng });
      if (address) {
        const formatted = [address.name, address.street, address.district || address.subregion, address.city, address.region, address.postalCode]
          .filter(Boolean)
          .join(", ");
        setPickupLocation(formatted);
        setIsPickupValid(true);
      }
    } catch (error) {
      console.warn("Helper task: GPS fetch failed:", error);
      Alert.alert("Error", "Could not fetch your current location. Please type it manually.");
    }
  };

  const handleSearch = async (text: string, type: "pickup" | "dropoff") => {
    if (type === "pickup") { setPickupLocation(text); setIsPickupValid(false); }
    else { setDropoffLocation(text); setIsDropoffValid(false); }
    setActiveField(type);
    if (text.trim().length < 2) { setSearchResults([]); return; }
    try {
      const data = await customFetch<any[]>(`/places/autocomplete?input=${encodeURIComponent(text)}`, { responseType: "json" });
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    }
  };

  const selectResult = async (result: any) => {
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      if (Number.isFinite(Number(result.lat)) && Number.isFinite(Number(result.lng))) {
        lat = Number(result.lat);
        lng = Number(result.lng);
      } else if (result.id) {
        const details = await customFetch<{ lat: number; lng: number }>(`/places/details/${result.id}`);
        if (details?.lat) { lat = details.lat; lng = details.lng; }
      }
      if (currentCoords && radius && lat !== null && lng !== null) {
        const distance = getDistanceFromLatLonInKm(currentCoords.lat, currentCoords.lng, lat, lng);
        if (distance > parseFloat(radius)) {
          Alert.alert("Out of range", `This location is outside your selected ${radius}km radius.`);
          setSearchResults([]);
          setActiveField(null);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to fetch/validate place details:", e);
    }
    const address = result.description || result.name || result.address || "";
    if (activeField === "pickup") {
      setPickupLocation(address);
      if (lat !== null && lng !== null) setPickupCoords({ lat, lng });
      setIsPickupValid(true);
    } else if (activeField === "dropoff") {
      setDropoffLocation(address);
      if (lat !== null && lng !== null) setDropoffCoords({ lat, lng });
      setIsDropoffValid(true);
    }
    setSearchResults([]);
    setActiveField(null);
  };

  const handleIncreasePrice = async (amount: number) => {
    if (!localOrderId) return;
    setIsIncreasingPrice(amount);
    try {
      const updatedOrder = await customFetch<any>(`/orders/${localOrderId}/increase-price`, {
        method: "PATCH",
        body: JSON.stringify({ amount }),
      });
      if (updatedOrder?.customerPrice) setCurrentTaskPrice(updatedOrder.customerPrice);
      else if (updatedOrder?.totalPrice) setCurrentTaskPrice(updatedOrder.totalPrice);
    } catch {
      Alert.alert("Error", "Failed to increase task price.");
    } finally {
      setIsIncreasingPrice(null);
    }
  };

  const handleCancel = () => {
    Alert.alert("Cancel this task?", "This can't be undone.", [
      { text: "Keep task", style: "cancel" },
      {
        text: "Cancel task",
        style: "destructive",
        onPress: async () => {
          if (localOrderId) {
            try {
              await customFetch(`/orders/${localOrderId}/status`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
            } catch (error) {
              console.warn("Failed to cancel order on backend", error);
            }
          }
          setStep("compose");
          setAssignedDriver(null);
          setOrderId(null);
          setLocalOrderId(null);
        },
      },
    ]);
  };

  const goToBidding = () => {
    if (!isPickupValid || !pickupCoords?.lat) {
      Alert.alert("Missing details", "Please select a valid pickup location.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Missing details", "Please provide a brief description of the work.");
      return;
    }
    setOffer((prev) => prev ?? calculatedFare);
    setStep("bidding");
  };

  const createTask = async () => {
    const finalOffer = offer ?? calculatedFare;
    setIsCreating(true);
    setStep("searching");
    setCurrentTaskPrice(finalOffer);
    try {
      const stops: any[] = [
        { sequence: 1, type: "pickup", address: pickupLocation, lat: pickupCoords?.lat, lng: pickupCoords?.lng, instructions: description },
      ];
      if (isDropoffValid && dropoffCoords?.lat) {
        stops.push({ sequence: 2, type: "drop", address: dropoffLocation, lat: dropoffCoords?.lat, lng: dropoffCoords?.lng });
      }
      const order = await customFetch<{ _id: string; customerPrice?: number; totalPrice?: number }>("/orders", {
        method: "POST",
        body: JSON.stringify({ serviceType: "helper", stops, duration: totalHours, totals: { total: finalOffer } }),
      });
      if (!order?._id) throw new Error("Invalid response from server. No order ID returned.");
      setOrderId(order._id);
      setLocalOrderId(order._id);
      setCurrentTaskPrice(order.customerPrice || order.totalPrice || finalOffer);
      socketService.trackOrder(order._id);

      const handleOrderAccepted = (data: any) => {
        if (data.driver) { setDriver(data.driver); setAssignedDriver(data.driver); }
        setServiceType("helper");
        if (data.orderId || order._id) { setOrderId(data.orderId || order._id); setLocalOrderId(data.orderId || order._id); }
        socketService.off("order_accepted", handleOrderAccepted);
        socketService.off("order_status_update", handleOrderStatus);
        setStep("assigned");
      };
      const handleOrderStatus = (data: any) => {
        if (["DRIVER_ASSIGNED", "driver_assigned", "accepted"].includes(data.status)) handleOrderAccepted(data);
      };
      socketService.on("order_accepted", handleOrderAccepted);
      socketService.on("order_status_update", handleOrderStatus);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create task");
      setStep("bidding");
    } finally {
      setIsCreating(false);
    }
  };

  const isProceedDisabled = !isPickupValid || description.trim().length === 0;
  const activeDriver = assignedDriver || driver;

  return (
    <ScreenShell>
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title={step === "compose" ? "Hire a helper" : step === "bidding" ? "Your offer" : step === "searching" ? "Finding a helper" : "Task assigned"}
        onBack={() => (step === "compose" ? router.back() : setStep("compose"))}
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
        entering={fadeIn(0)}
      />

      {step === "compose" && (
        <TaskComposeForm
          TASK_TYPES={TASK_TYPES}
          accent={accent}
          activeField={activeField}
          calculatedFare={calculatedFare}
          customHours={customHours}
          customMinutes={customMinutes}
          description={description}
          dropoffLocation={dropoffLocation}
          durationMode={durationMode}
          goToBidding={goToBidding}
          handleSearch={handleSearch}
          handleUseCurrentLocation={handleUseCurrentLocation}
          insets={insets}
          isProceedDisabled={isProceedDisabled}
          offer={offer}
          pickupLocation={pickupLocation}
          searchResults={searchResults}
          selectResult={selectResult}
          setActiveField={setActiveField}
          setCustomHours={setCustomHours}
          setCustomMinutes={setCustomMinutes}
          setDescription={setDescription}
          setDurationMode={setDurationMode}
          setTaskType={setTaskType}
          styles={styles}
          suggestedHigh={suggestedHigh}
          suggestedLow={suggestedLow}
          taskType={taskType}
          tokens={tokens}
        />
      )}

      {step === "bidding" && (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <HelperTaskOfferBlock
              calculatedFare={calculatedFare}
              offer={offer}
              styles={styles}
              totalHours={totalHours}
            />

            <HelperTaskSection
              accent={accent}
              calculatedFare={calculatedFare}
              setOffer={setOffer}
              styles={styles}
            />
          </ScrollView>

          <TaskBiddingPanel
            calculatedFare={calculatedFare}
            createTask={createTask}
            insets={insets}
            isCreating={isCreating}
            offer={offer}
            styles={styles}
          />
        </View>
      )}

      {step === "searching" && (
        <HelperTaskBody
          accent={accent}
          calculatedFare={calculatedFare}
          currentTaskPrice={currentTaskPrice}
          handleCancel={handleCancel}
          handleIncreasePrice={handleIncreasePrice}
          insets={insets}
          isIncreasingPrice={isIncreasingPrice}
          offer={offer}
          rejectedCount={rejectedCount}
          styles={styles}
          totalContacted={totalContacted}
        />
      )}

      {step === "assigned" && activeDriver && (
        <TaskAssignedPanel
          Linking={Linking}
          activeDriver={activeDriver}
          currentTaskPrice={currentTaskPrice}
          dropoffLocation={dropoffLocation}
          handleCancel={handleCancel}
          insets={insets}
          offer={offer}
          pickupLocation={pickupLocation}
          startOtp={startOtp}
          styles={styles}
          tokens={tokens}
        />
      )}
    </ScreenShell>
  );
}
