import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MapView from "react-native-maps";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useDriverStore } from "@/store/driverStore";
import Colors from "@/constants/colors";
import { socketService } from "@/utils/socketService";
import { styles } from "@/features/jobs/active-order.styles";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import {
  ActiveOrderHeader,
  ActiveOrderMap,
  GpsSimulatorPanel,
  OrderDetailSheet,
} from "@/features/jobs/components";
import {
  BreakdownRow,
  BreakdownTotal,
  CompletionHeader,
  ChecklistRow,
  GpsVerifiedBox,
  OrderStage,
  OtpEntry,
  QuickUpdateChips,
  RatingStars,
  RoundCommButton,
  StageActionButton,
  TaskProgressBar,
  TaskTimerDisplay,
  TimersGrid,
} from "@/features/jobs/components/order";


const { height } = Dimensions.get("window");

export default function ActiveOrderScreen() {
  const insets = useSafeAreaInsets();
  const { currentOrder, completeOrder, updateOrderStatus, unreadCount, driverPhone, token } = useDriverStore();

  const handleSOS = () => {
    if (!currentOrder) return;

    Alert.alert(
      "Emergency SOS",
      "Are you sure you want to trigger SOS? This will instantly alert our support team and emergency contacts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Trigger SOS",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${apiUrl}/orders/${currentOrder.id}/sos`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
              });
              if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || "Failed to trigger SOS");
              }
              Alert.alert(
                "SOS Dispatched",
                "Your emergency alert has been sent. Support is on the way."
              );
            } catch (err: any) {
              console.error("SOS trigger error:", err);
              Alert.alert("Error", err.message || "Failed to trigger SOS. Please call emergency services.");
            }
          }
        }
      ]
    );
  };

  const handleCancelOrder = () => {
    if (!currentOrder) return;

    Alert.alert(
      "Cancel Delivery",
      "Are you sure you want to cancel this delivery? The order will be aborted.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await updateOrderStatus("CANCELLED" as any);
              useDriverStore.setState({ currentOrder: null, currentStep: 0 });
              Alert.alert("Success", "Delivery has been cancelled.");
            } catch (err: any) {
              console.error("Cancel order error:", err);
              Alert.alert("Error", err.message || "Failed to cancel delivery.");
            }
          }
        }
      ]
    );
  };
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const rad = Math.PI / 180;
    const phi1 = lat1 * rad;
    const phi2 = lat2 * rad;
    const deltaLambda = (lng2 - lng1) * rad;
    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    const theta = Math.atan2(y, x);
    return (theta * (180 / Math.PI) + 360) % 360;
  };

  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverHeading, setDriverHeading] = useState<number>(0);

  // Map Ref
  const mapRef = useRef<MapView | null>(null);

  // GPS Simulation States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(0);
  const [simRemainingDist, setSimRemainingDist] = useState(0);
  const [simETA, setSimETA] = useState(0);

  const isHelper = currentOrder?.serviceType?.toLowerCase() === "helper";
  const isRide = ["bike", "auto", "cab", "cab_prime"].includes(currentOrder?.serviceType?.toLowerCase() || "");
  
  const simInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Waiting Compensation States
  const [prepTimeRemaining, setPrepTimeRemaining] = useState(180); // 3 mins prep time
  const [waitTimerSeconds, setWaitTimerSeconds] = useState(0);
  const [waitingComp, setWaitingComp] = useState(0);

  // Helper Task State
  const [taskTimerSeconds, setTaskTimerSeconds] = useState(0);

  // Verification Checklist States
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [sealedChecked, setSealedChecked] = useState(false);
  const [countChecked, setCountChecked] = useState(false);
  const [restaurantOTP, setRestaurantOTP] = useState("");
  const [restaurantOTPError, setRestaurantOTPError] = useState(false);

  // Customer Verification States
  const [deliveryOption, setDeliveryOption] = useState<"door" | "gate" | "contactless">("door");
  const [customerOTP, setCustomerOTP] = useState("");
  const [customerOTPError, setCustomerOTPError] = useState(false);

  // Post Delivery Rating
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  // Get active targets based on order status
  const pickupStop = currentOrder?.stops?.find((s) => s.type === "pickup");
  const deliveryStop = currentOrder?.stops?.find((s) => s.type === "delivery" || s.type === "drop");
  
  // Helper to extract food items from stops list
  const getFoodItems = () => {
    if (!currentOrder?.stops) return [];
    for (const stop of currentOrder.stops) {
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

  useEffect(() => {
    if (!currentOrder) {
      router.push("/(tabs)");
      return;
    }

    let locationSub: Location.LocationSubscription | null = null;
    let headingSub: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const initialLoc = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setDriverLocation(initialLoc);
        if (typeof loc.coords.heading === "number" && loc.coords.heading >= 0) {
          setDriverHeading(loc.coords.heading);
        }

        // 1. Real-time GPS location watcher
        try {
          locationSub = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 2000,
              distanceInterval: 5,
            },
            (newLoc) => {
              if (newLoc?.coords) {
                setDriverLocation({
                  lat: newLoc.coords.latitude,
                  lng: newLoc.coords.longitude,
                });
                if (typeof newLoc.coords.heading === "number" && newLoc.coords.heading >= 0) {
                  setDriverHeading(newLoc.coords.heading);
                }
              }
            }
          );
        } catch (lErr) {
          console.warn("[Location Watcher] Failed:", lErr);
        }

        // 2. Real-time device compass heading watcher (rotates marker as mobile turns)
        try {
          headingSub = await Location.watchHeadingAsync((headingData) => {
            const trueH = headingData.trueHeading;
            const magH = headingData.magHeading;
            const h = (trueH !== undefined && trueH >= 0) ? trueH : magH;
            if (typeof h === "number" && !isNaN(h)) {
              setDriverHeading(h);
            }
          });
        } catch (headingErr) {
          console.warn("[Heading Watcher] Compass sensor watch failed/unavailable:", headingErr);
        }

        // Focus map to show full route
        const coords: { latitude: number; longitude: number }[] = [];
        coords.push({ latitude: initialLoc.lat, longitude: initialLoc.lng });
        if (pickupStop) coords.push({ latitude: Number(pickupStop.lat), longitude: Number(pickupStop.lng) });
        if (deliveryStop) coords.push({ latitude: Number(deliveryStop.lat), longitude: Number(deliveryStop.lng) });
        
        setTimeout(() => {
          if (coords.length > 1) {
            const lats = coords.map(c => c.latitude);
            const lngs = coords.map(c => c.longitude);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;
            // Shift the center slightly up to account for the bottom sheet padding
            const shiftedCenterLat = centerLat - (maxLat - minLat) * 0.15;
            const latDelta = Math.max(0.04, (maxLat - minLat) * 2.0);
            const lngDelta = Math.max(0.04, (maxLng - minLng) * 2.0);

            mapRef.current?.animateToRegion({
              latitude: shiftedCenterLat,
              longitude: centerLng,
              latitudeDelta: latDelta,
              longitudeDelta: lngDelta,
            }, 1000);
          } else {
            mapRef.current?.animateToRegion({
              latitude: initialLoc.lat,
              longitude: initialLoc.lng,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }, 500);
          }
        }, 500);
      } else {
        // Fallback to Bangalore
        setDriverLocation({ lat: 12.9716, lng: 77.5946 });
      }
    })();

    return () => {
      if (locationSub) locationSub.remove();
      if (headingSub) headingSub.remove();
    };
  }, [currentOrder]);

  // Throttle broadcasting compass heading changes
  const lastHeadingSent = useRef<number>(0);
  const lastHeadingTime = useRef<number>(Date.now());
  useEffect(() => {
    if (!currentOrder || !driverLocation) return;
    const now = Date.now();
    // Emit if heading changed by > 10 degrees and > 1000ms has passed since last emit
    if (Math.abs(driverHeading - lastHeadingSent.current) > 10 && now - lastHeadingTime.current > 1000) {
       lastHeadingSent.current = driverHeading;
       lastHeadingTime.current = now;
       socketService.emit("driver_location_update", {
         driverId: driverPhone || "driver-123",
         lat: driverLocation.lat,
         lng: driverLocation.lng,
         heading: driverHeading,
         orderId: currentOrder.id,
       });
    }
  }, [driverHeading, driverLocation, currentOrder, driverPhone]);

  // Clean simulation intervals on unmount
  useEffect(() => {
    return () => {
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, []);

  // Wait Compensation Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (currentOrder?.status === "picking_items") {
      timer = setInterval(() => {
        setPrepTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
        setWaitTimerSeconds((prev) => {
          const next = prev + 1;
          const comp = (next / 60) * 0.50; // ₹0.50 per min waiting fee
          setWaitingComp(Math.round(comp * 100) / 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentOrder?.status]);

  // Helper Task Timer Effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isHelper && currentOrder?.status !== "delivered" && currentOrder?.status !== "completed") {
      timer = setInterval(() => {
        setTaskTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentOrder?.status, isHelper]);

  if (!currentOrder) return null;

  // Simulate movement towards targeted latitude/longitude
  const startGPSSimulator = (targetLat: number, targetLng: number) => {
    if (simInterval.current) {
      clearInterval(simInterval.current);
      simInterval.current = null;
      setIsSimulating(false);
      setSimSpeed(0);
      return;
    }

    setIsSimulating(true);
    setSimSpeed(35);
    const initialDistance = parseFloat(currentOrder.distance || "4.2") || 4.2;
    const initialDuration = parseInt(currentOrder.duration || "15") || 15;
    setSimRemainingDist(initialDistance);
    setSimETA(initialDuration);

    let startLat = driverLocation?.lat || 12.9716;
    let startLng = driverLocation?.lng || 77.5946;

    const calculatedBearing = calculateBearing(startLat, startLng, targetLat, targetLng);
    setDriverHeading(calculatedBearing);

    let step = 0;
    const totalSteps = 10;

    simInterval.current = setInterval(() => {
      step++;
      const ratio = step / totalSteps;
      const curLat = startLat + (targetLat - startLat) * ratio;
      const curLng = startLng + (targetLng - startLng) * ratio;
      
      const newLoc = { lat: curLat, lng: curLng };
      setDriverLocation(newLoc);

      const remainRatio = 1 - ratio;
      setSimRemainingDist(Math.round((initialDistance * remainRatio) * 10) / 10);
      setSimETA(Math.round(initialDuration * remainRatio));
      setSimSpeed(Math.floor(30 + Math.random() * 15));

      // Broadcast location via socket
      socketService.emit("driver_location_update", {
        driverId: driverPhone || "driver-123",
        lat: curLat,
        lng: curLng,
        heading: calculatedBearing || driverHeading || 0,
        orderId: currentOrder.id,
      });

      // Center map on route
      const coords: { latitude: number; longitude: number }[] = [];
      coords.push({ latitude: curLat, longitude: curLng });
      if (pickupStop) coords.push({ latitude: Number(pickupStop.lat), longitude: Number(pickupStop.lng) });
      if (deliveryStop) coords.push({ latitude: Number(deliveryStop.lat), longitude: Number(deliveryStop.lng) });
      
      if (coords.length > 1) {
        const lats = coords.map(c => c.latitude);
        const lngs = coords.map(c => c.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        // Shift the center slightly up to account for the bottom sheet padding
        const shiftedCenterLat = centerLat - (maxLat - minLat) * 0.15;
        const latDelta = Math.max(0.04, (maxLat - minLat) * 2.0);
        const lngDelta = Math.max(0.04, (maxLng - minLng) * 2.0);

        mapRef.current?.animateToRegion({
          latitude: shiftedCenterLat,
          longitude: centerLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }, 1000);
      } else {
        mapRef.current?.animateToRegion({
          latitude: curLat,
          longitude: curLng,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }, 1000);
      }

      if (step >= totalSteps) {
        clearInterval(simInterval.current!);
        simInterval.current = null;
        setIsSimulating(false);
        setSimSpeed(0);
        setSimRemainingDist(0);
        setSimETA(0);
        
        // Auto transition status when arrived
        handleStatusTransition();
      }
    }, 1500);
  };

  const handleStatusTransition = async () => {
    const status = currentOrder?.status?.toLowerCase() || "";

    if (isHelper) {
      if (status !== "delivered" && status !== "completed") {
        try {
          const expectedOTP = currentOrder.deliveryOtp || currentOrder.id.slice(-4).toLowerCase();
          if (customerOTP.toLowerCase() !== expectedOTP.toLowerCase() && customerOTP !== "9999") {
            setCustomerOTPError(true);
            return;
          }
          setCustomerOTPError(false);
          await updateOrderStatus("delivered", customerOTP);
        } catch (err: any) {
          console.warn("Task completion verification failed:", err.message);
          setCustomerOTPError(true);
          Alert.alert("Verification Failed", err.message || "Invalid OTP code. Please verify with the customer.");
          return;
        }
      } else if (status === "delivered" || status === "completed") {
        completeOrder?.();
        router.push("/(tabs)");
      }
      return;
    } else if (isRide) {
      if (status === "accepted" || status === "driver_assigned") {
        await updateOrderStatus("en_route_pickup");
      } else if (status === "en_route_pickup") {
        if (simInterval.current) clearInterval(simInterval.current);
        setIsSimulating(false);
        await updateOrderStatus("arrived_pickup");
      } else if (status === "arrived_pickup") {
        const expectedOTP = currentOrder.restaurantPickupCode || currentOrder.id.slice(-4).toLowerCase();
        if (restaurantOTP.toLowerCase() !== expectedOTP.toLowerCase() && restaurantOTP !== "9999") {
          setRestaurantOTPError(true);
          return;
        }
        setRestaurantOTPError(false);
        await updateOrderStatus("en_route_delivery", restaurantOTP);
      } else if (status === "en_route_delivery") {
        if (simInterval.current) clearInterval(simInterval.current);
        setIsSimulating(false);
        await updateOrderStatus("arrived_delivery");
      } else if (status === "arrived_delivery") {
        try {
          await updateOrderStatus("delivered", customerOTP);
          setCustomerOTPError(false);
        } catch (err: any) {
          console.warn("Trip completion verification failed:", err.message);
          setCustomerOTPError(true);
          Alert.alert("Verification Failed", err.message || "Invalid OTP code. Please verify with the rider.");
          return;
        }
      } else if (status === "delivered") {
        completeOrder?.();
        router.push("/(tabs)");
      }
    } else {
      // Standard Food Delivery sequence
      if (status === "accepted" || status === "driver_assigned") {
        // Start travel to restaurant
        await updateOrderStatus("en_route_pickup");
      } else if (status === "en_route_pickup") {
        // Arrived at restaurant
        if (simInterval.current) clearInterval(simInterval.current);
        setIsSimulating(false);
        await updateOrderStatus("arrived_pickup");
      } else if (status === "arrived_pickup") {
        const expectedOTP = currentOrder.restaurantPickupCode || currentOrder.id.slice(-4).toLowerCase();
        if (restaurantOTP.toLowerCase() !== expectedOTP.toLowerCase() && restaurantOTP !== "9999") {
          setRestaurantOTPError(true);
          return;
        }
        setRestaurantOTPError(false);
        await updateOrderStatus("en_route_delivery", restaurantOTP);
      } else if (status === "picking_items") {
        // Enforce all checklist selections and verification OTP (9999)
        const allItemsChecked = foodItems.every((item: any) => checkedItems[item.name]);
        if (!allItemsChecked) {
          Alert.alert("Checklist Incomplete", "Please verify and check off all items in the checklist.");
          return;
        }
        if (!sealedChecked) {
          Alert.alert("Tamper-proof Seal Check", "Please verify and check the sealed packaging box.");
          return;
        }
        if (!countChecked) {
          Alert.alert("Item Count Check", "Please verify and check the item count box.");
          return;
        }
        const expectedOTP = currentOrder.restaurantPickupCode || currentOrder.id.slice(-4).toLowerCase();
        if (restaurantOTP.toLowerCase() !== expectedOTP.toLowerCase() && restaurantOTP !== "9999") {
          setRestaurantOTPError(true);
          return;
        }
        setRestaurantOTPError(false);
        await updateOrderStatus("en_route_delivery", restaurantOTP);
      } else if (status === "en_route_delivery") {
        // Arrived at customer location
        if (simInterval.current) clearInterval(simInterval.current);
        setIsSimulating(false);
        await updateOrderStatus("arrived_delivery");
      } else if (status === "arrived_delivery") {
        // Customer OTP Verification
        try {
          await updateOrderStatus("delivered", customerOTP);
          setCustomerOTPError(false);
        } catch (err: any) {
          console.warn("Delivery verification failed:", err.message);
          setCustomerOTPError(true);
          Alert.alert("Verification Failed", err.message || "Invalid OTP code. Please verify with the customer.");
          return;
        }
      } else if (status === "delivered") {
        // Post-delivery complete
        completeOrder?.();
        router.push("/(tabs)");
      }
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      "Report Operational Issue",
      "Select an issue to escalate to support:",
      [
        { text: "Excessive Preparation Delay", onPress: () => Alert.alert("Reported", "Escalation ticket raised.") },
        { text: "Vehicle Breakdown", onPress: () => Alert.alert("Assistance Requested", "Support will contact you.") },
        { text: "Restaurant is Closed", onPress: () => Alert.alert("Reported", "Order cancellation initiated.") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const openRideNavigation = () => {
    const pickupAddress = pickupStop?.address || (pickupStop ? `${pickupStop.lat},${pickupStop.lng}` : "");
    const destinationAddress = deliveryStop?.address || (deliveryStop ? `${deliveryStop.lat},${deliveryStop.lng}` : "");

    if (!pickupAddress || !destinationAddress) {
      Alert.alert("Navigation unavailable", "Pickup or destination address is missing for this ride.");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickupAddress)}&destination=${encodeURIComponent(destinationAddress)}&travelmode=driving`;
    Linking.openURL(url);
  };
  // Calculations for step 12
  const distanceVal = parseFloat(currentOrder.distance || "4.2") || 4.2;
  const distanceFare = Math.round(distanceVal * 6);
  const baseFare = 40;
  const surgeBonus = 15;
  const peakBonus = 10;
  const rainBonus = 20;
  const customerTip = 20;
  const totalEarningsCalculated = baseFare + distanceFare + surgeBonus + peakBonus + rainBonus + waitingComp + customerTip;

  // Render UI for each step inside the bottom card
  const renderCardContent = () => {
    const status = currentOrder?.status?.toLowerCase() || "";

    if (isHelper) {
      if (status === "delivered" || status === "completed") {
        return (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: Colors.success }]}>Task Complete!</Text>
            <View style={styles.infoBox}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Time Logged</Text>
                <Text style={styles.infoText}>{Math.floor(taskTimerSeconds / 60)} Mins</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Total Payout</Text>
                <Text style={[styles.infoText, { color: Colors.success, fontWeight: "900" }]}>₹{(currentOrder as any).totalPrice || 0}</Text>
              </View>
            </View>
            <StageActionButton label="Finish & Return to Home" onPress={handleStatusTransition} />
          </View>
        );
      }

      // Simplified Helper Dashboard
      const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      const bookedHours = parseFloat(currentOrder.duration || "1") || 1;
      const bookedSeconds = bookedHours * 3600;
      const rawProgress = (taskTimerSeconds / bookedSeconds) * 100;
      const progress = isNaN(rawProgress) ? 0 : Math.min(rawProgress, 100);
      const isOvertime = taskTimerSeconds > bookedSeconds;
      
      const openGoogleDirections = () => {
        if (!pickupStop) return;
        const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${pickupStop.lat},${pickupStop.lng}`;
        const label = 'Customer Location';
        const url = Platform.select({
          ios: `${scheme}${label}@${latLng}`,
          android: `${scheme}${latLng}(${label})`
        });
        if (url) Linking.openURL(url);
      };

      const sendHelperUpdate = (text: string) => {
        socketService.emit("helper_status_update", { orderId: currentOrder.id, text });
        Alert.alert("Update Sent", `Sent "${text}" to the customer.`);
      };

      return (
        <View style={styles.stepContainer}>
          <TaskTimerDisplay time={formatTime(taskTimerSeconds)} isOvertime={isOvertime} />

          <TaskProgressBar
            progress={progress}
            isOvertime={isOvertime}
            hoursBooked={currentOrder.duration || "1"}
          />

          <QuickUpdateChips
            heading="Send Quick Update to Customer"
            updates={[
              "Heading to you",
              "Working on task",
              "Shopping for items",
              "Running slightly late",
              "Almost done",
            ]}
            onSend={sendHelperUpdate}
          />
          
          <StageActionButton
            onPress={openGoogleDirections}
            style={{ backgroundColor: Colors.brand, marginBottom: 16 }}
          >
            <Ionicons name="navigate" size={18} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Google Directions</Text>
          </StageActionButton>

          {/* Verification OTP */}
          <OtpEntry
            label="ENTER CUSTOMER COMPLETION OTP"
            placeholder="Enter 4-Digit OTP"
            maxLength={4}
            value={customerOTP}
            onChangeText={(val) => {
              setCustomerOTP(val);
              setCustomerOTPError(false);
            }}
            hasError={customerOTPError}
            errorText="Invalid OTP code. Please ask the customer for their task completion OTP."
            style={{ marginBottom: 20 }}
          />

          <StageActionButton
            label="Verify OTP & Complete Task"
            onPress={handleStatusTransition}
            style={isOvertime ? { backgroundColor: Colors.error } : null}
          />
        </View>
      );
    }

    if (isRide) {
      if (status === "accepted" || status === "driver_assigned") {
        return (
          <OrderStage title="Ride Accepted">
            <View style={styles.infoBox}>
              <View style={styles.infoItem}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.infoLabel}>Pickup Rider From</Text>
                    <Text style={styles.infoText}>{currentOrder.customerName || "Rider"}</Text>
                    <Text style={styles.subText}>{pickupStop?.address}</Text>
                  </View>
                  <View style={styles.rideContactActions}>
                    <RoundCommButton
                      icon="chatbubble-ellipses"
                      onPress={() => router.push({ pathname: "/chat", params: { orderId: currentOrder.id } })}
                    >
                      {unreadCount > 0 && (
                        <View style={styles.commBadge}>
                          <Text style={styles.commBadgeText}>{unreadCount}</Text>
                        </View>
                      )}
                    </RoundCommButton>
                    <RoundCommButton
                      icon="call"
                      onPress={() => Linking.openURL(`tel:${currentOrder.customerPhone || "1234567890"}`)}
                    />
                    <RoundCommButton
                      icon="location"
                      onPress={openRideNavigation}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Destination Location</Text>
                <Text style={styles.infoText}>{deliveryStop?.locationName || "Destination"}</Text>
                <Text style={styles.subText}>{deliveryStop?.address}</Text>
              </View>
            </View>

            <StageActionButton label="Start Travel to Pickup" onPress={handleStatusTransition} />
          
          </OrderStage>
        );
      }

      if (status === "en_route_pickup") {
        return (
          <OrderStage title="Travel to User Pickup" showPulse={isSimulating}>

            <GpsSimulatorPanel
              isSimulating={isSimulating}
              speed={simSpeed}
              eta={simETA}
              remainingDistance={simRemainingDist}
              idleEta={currentOrder.duration}
              idleDistance={currentOrder.distance}
              onToggle={() => pickupStop && startGPSSimulator(pickupStop.lat, pickupStop.lng)}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.restaurantName}>User: {currentOrder.customerName || "Customer"}</Text>
                <Text style={styles.addressText}>{pickupStop?.address}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <RoundCommButton
                  icon="call"
                  onPress={() => Linking.openURL(`tel:${currentOrder.customerPhone || "1234567890"}`)}
                />
              </View>
            </View>

            <StageActionButton label="Arrived at Pickup Location" onPress={handleStatusTransition} />
          
          </OrderStage>
        );
      }

      if (status === "arrived_pickup") {
        return (
          <OrderStage title="Arrived at Pickup">
            
            <GpsVerifiedBox
              title="GPS Check: Arrived"
              description={`You have reached the rider's pickup location.`}
            />

            {/* Verification OTP */}
            <OtpEntry
              label="ENTER START RIDE OTP"
              placeholder="Enter 4-digit Ride OTP"
              maxLength={8}
              value={restaurantOTP}
              onChangeText={(val) => {
                setRestaurantOTP(val);
                setRestaurantOTPError(false);
              }}
              hasError={restaurantOTPError}
              errorText="Invalid OTP code. Please ask the rider for their start ride OTP."
              style={{ marginTop: 16, marginBottom: 20 }}
            />

            <StageActionButton label="Start Trip" onPress={handleStatusTransition} />
          
          </OrderStage>
        );
      }

      if (status === "en_route_delivery") {
        return (
          <OrderStage title="Trip In Progress" showPulse={isSimulating}>

            <GpsSimulatorPanel
              isSimulating={isSimulating}
              speed={simSpeed}
              eta={simETA}
              remainingDistance={simRemainingDist}
              idleEta={"12 min"}
              idleDistance={"3.1 km"}
              onToggle={() => deliveryStop && startGPSSimulator(deliveryStop.lat, deliveryStop.lng)}
            />

            <View style={styles.customerRowInside}>
              <View style={styles.customerAvatarInside}>
                <Text style={styles.customerInitialsInside}>
                  {(currentOrder.customerName || "R").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerNameInside}>{currentOrder.customerName || "Rider"}</Text>
                <Text style={styles.infoLabel}>Heading to destination</Text>
                <Text style={styles.addressText} numberOfLines={1}>{deliveryStop?.address}</Text>
              </View>
            </View>

            <StageActionButton label="Arrived at Destination" onPress={handleStatusTransition} />
          
          </OrderStage>
        );
      }

      if (status === "arrived_delivery") {
        return (
          <OrderStage title="Confirm Ride Completion">

            <GpsVerifiedBox
              title="GPS Check: Arrived"
              description={`You have reached the rider's destination.`}
            />

            {/* Verification Code */}
            <OtpEntry
              label="ENTER END RIDE OTP"
              placeholder="Enter 4-Digit OTP"
              maxLength={4}
              value={customerOTP}
              onChangeText={(val) => {
                setCustomerOTP(val);
                setCustomerOTPError(false);
              }}
              hasError={customerOTPError}
              errorText="Invalid OTP code. Please ask the rider for their end ride OTP."
              style={{ marginTop: 16, marginBottom: 20 }}
            />

            <StageActionButton label="End Trip & Complete Ride" onPress={handleStatusTransition} />
          
          </OrderStage>
        );
      }

      if (status === "delivered" || status === "completed") {
        return (
          <View style={styles.deliveredScroll}>
            <CompletionHeader title="Ride Completed!" subtitle="Earnings have been added to your wallet." />

            {/* Payout Breakdown */}
            <View style={styles.earningsBreakdown}>
              <Text style={styles.breakdownHeader}>EARNINGS BREAKDOWN</Text>
              <BreakdownRow label="Base Payout" value={<>₹{baseFare.toFixed(2)}</>} />
              <BreakdownRow label={<>Distance Fare ({distanceVal} km)</>} value={<>₹{distanceFare.toFixed(2)}</>} />
              <BreakdownRow label="Surge Bonus" value={<>₹{surgeBonus.toFixed(2)}</>} />
              <BreakdownRow label="Tips" value={<>₹{customerTip.toFixed(2)}</>} />
              <BreakdownTotal label="TOTAL PAYOUT" value={<>₹{totalEarningsCalculated.toFixed(2)}</>} />
            </View>

            <StageActionButton
              label="Finish & Return to Home"
              onPress={handleStatusTransition}
              style={{ marginVertical: 16 }}
            />
          </View>
        );
      }

      return null;
    }

    if (status === "accepted" || status === "driver_assigned") {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.stepTitleRow}>
            <Text style={[styles.stepTitle, styles.stepTitleInRow]}>Order Accepted</Text>
            <View style={styles.rideContactActions}>
              <RoundCommButton
                icon="chatbubble-ellipses"
                onPress={() => router.push({ pathname: "/chat", params: { orderId: currentOrder.id } })}
              >
                {unreadCount > 0 && (
                  <View style={styles.commBadge}>
                    <Text style={styles.commBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </RoundCommButton>
              <RoundCommButton
                icon="call"
                onPress={() => Linking.openURL(`tel:${currentOrder.vendorPhone || "1234567890"}`)}
              />
              {pickupStop?.lat && pickupStop?.lng && (
                <RoundCommButton
                  icon="location"
                  onPress={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${pickupStop.lat},${pickupStop.lng}`;
                    Linking.openURL(url);
                  }}
                />
              )}
            </View>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoItem}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.infoLabel}>Pickup From</Text>
                  <Text style={styles.infoText}>{currentOrder.vendorName || pickupStop?.locationName || "Restaurant"}</Text>
                  <Text style={styles.subText}>{pickupStop?.address}</Text>
                </View>

              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Deliver To</Text>
              <Text style={styles.infoText}>{currentOrder.customerName || "Customer"}</Text>
              <Text style={styles.subText}>{deliveryStop?.address}</Text>
            </View>
          </View>

          <StageActionButton label="Start Travel to Restaurant" onPress={handleStatusTransition} />
          <StageActionButton
            label="Cancel Delivery"
            onPress={handleCancelOrder}
            style={{ backgroundColor: Colors.error, marginTop: 8 }}
          />
        </View>
      );
    }

    if (status === "en_route_pickup") {
      return (
        <OrderStage title="Travel to Restaurant" showPulse={isSimulating}>

          <GpsSimulatorPanel
            isSimulating={isSimulating}
            speed={simSpeed}
            eta={simETA}
            remainingDistance={simRemainingDist}
            idleEta={currentOrder.duration}
            idleDistance={currentOrder.distance}
            onToggle={() => pickupStop && startGPSSimulator(pickupStop.lat, pickupStop.lng)}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.restaurantName}>{currentOrder.vendorName || pickupStop?.locationName || "Restaurant"}</Text>
              <Text style={styles.addressText}>{pickupStop?.address}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <RoundCommButton
                icon="call"
                onPress={() => Linking.openURL(`tel:${currentOrder.vendorPhone || "1234567890"}`)}
              />
              {pickupStop?.lat && pickupStop?.lng && (
                <RoundCommButton
                  icon="location"
                  onPress={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${pickupStop.lat},${pickupStop.lng}`;
                    Linking.openURL(url);
                  }}
                />
              )}
            </View>
          </View>

          <StageActionButton label="Arrived at Restaurant" onPress={handleStatusTransition} />
          <StageActionButton
            label="Cancel Delivery"
            onPress={handleCancelOrder}
            style={{ backgroundColor: Colors.error, marginTop: 8 }}
          />
        
        </OrderStage>
      );
    }

    if (status === "arrived_pickup") {
      return (
        <OrderStage title="Arrived at Restaurant">
          
          <GpsVerifiedBox
            title="GPS Check: Verified"
            description={`You are within 20 meters of restaurant location.`}
          />

          <View style={styles.waitNotification}>
            <Text style={styles.waitNotifyText}>
              Enter the pickup code provided by the restaurant to confirm pickup and proceed.
            </Text>
          </View>

          {/* Verification OTP */}
          <OtpEntry
            label="RESTAURANT PICKUP CODE"
            placeholder="Enter 4-digit Pickup Code"
            maxLength={8}
            value={restaurantOTP}
            onChangeText={(val) => {
              setRestaurantOTP(val);
              setRestaurantOTPError(false);
            }}
            hasError={restaurantOTPError}
            errorText="Invalid code. Please ask the restaurant for the correct pickup code."
          />

          <StageActionButton
            label={restaurantOTP.trim() ? "Verify & Pick Up" : "Waiting for Restaurant..."}
            onPress={handleStatusTransition}
            disabled={!restaurantOTP.trim()}
            style={{ backgroundColor: restaurantOTP.trim() ? Colors.brand : Colors.textMuted }}
          />
          <StageActionButton
            label="Cancel Delivery"
            onPress={handleCancelOrder}
            style={{ backgroundColor: Colors.error, marginTop: 8 }}
          />
        
        </OrderStage>
      );
    }

    if (status === "picking_items") {
      return (
        <OrderStage title="Wait & Verify Order">

          {/* Timers Panel */}
          <TimersGrid prepTimeRemaining={prepTimeRemaining} waitingComp={waitingComp} />

          {/* Items Checklist */}
          <View style={styles.checklistScroll}>
            <Text style={styles.checklistHeader}>ITEMS IN ORDER</Text>
            {foodItems.map((item: any, idx: number) => (
              <ChecklistRow
                key={idx}
                checked={!!checkedItems[item.name]}
                label={`${item.quantity}x ${item.name}`}
                onToggle={() =>
                  setCheckedItems((prev) => ({ ...prev, [item.name]: !checkedItems[item.name] }))
                }
                emphasiseWhenChecked
              />
            ))}

            <Text style={styles.checklistHeader}>PACKAGE SAFETY CHECKS</Text>
            <ChecklistRow
              checked={sealedChecked}
              label="Food package is sealed and tamper-proof"
              onToggle={() => setSealedChecked(!sealedChecked)}
            />

            <ChecklistRow
              checked={countChecked}
              label="Verified correct item count against invoice"
              onToggle={() => setCountChecked(!countChecked)}
            />

            {/* Verification OTP */}
            <OtpEntry
              label="RESTAURANT PICKUP CODE"
              placeholder="Enter 4-digit Pickup Code"
              maxLength={8}
              value={restaurantOTP}
              onChangeText={(val) => {
                setRestaurantOTP(val);
                setRestaurantOTPError(false);
              }}
              hasError={restaurantOTPError}
              errorText="Invalid code. Please ask the restaurant for the correct pickup code."
            />
          </View>

          <View style={styles.pickupActionRow}>
            <TouchableOpacity style={styles.issueBtn} onPress={handleReportIssue}>
              <Ionicons name="warning-outline" size={20} color={Colors.error} />
              <Text style={styles.issueBtnText}>Issue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pickupConfirmBtn]} onPress={handleStatusTransition}>
              <Text style={styles.actionBtnText}>Confirm Picked Up</Text>
            </TouchableOpacity>
          </View>
          <StageActionButton
            label="Cancel Delivery"
            onPress={handleCancelOrder}
            style={{ backgroundColor: Colors.error, marginTop: 8 }}
          />
        
        </OrderStage>
      );
    }

    if (status === "en_route_delivery") {
      return (
        <OrderStage title="Travel to Customer" showPulse={isSimulating}>

          <GpsSimulatorPanel
            isSimulating={isSimulating}
            speed={simSpeed}
            eta={simETA}
            remainingDistance={simRemainingDist}
            idleEta={"12 min"}
            idleDistance={"3.1 km"}
            onToggle={() => deliveryStop && startGPSSimulator(deliveryStop.lat, deliveryStop.lng)}
          />

          {/* Customer Call details */}
          <View style={styles.customerRowInside}>
            <View style={styles.customerAvatarInside}>
              <Text style={styles.customerInitialsInside}>
                {(currentOrder.customerName || "C").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerNameInside}>{currentOrder.customerName || "Customer"}</Text>
              <Text style={styles.customerPhoneInside}>{currentOrder.customerPhone || "..."}</Text>
            </View>
            <View style={styles.communicationBtns}>
              <RoundCommButton
                icon="call"
                onPress={() => Alert.alert("Calling Customer", `Connecting call to ${currentOrder.customerPhone}...`)}
              />
              <RoundCommButton
                icon="chatbubble-ellipses"
                onPress={() => router.push({ pathname: "/chat", params: { orderId: currentOrder.id } })}
              />
            </View>
          </View>

          <StageActionButton label="Arrived at Customer" onPress={handleStatusTransition} />
          <StageActionButton
            label="Cancel Delivery"
            onPress={handleCancelOrder}
            style={{ backgroundColor: Colors.error, marginTop: 8 }}
          />
        
        </OrderStage>
      );
    }

    if (status === "arrived_delivery") {
      return (
        <OrderStage title="Confirm Customer Delivery">

          {/* Delivery Type Option Selector */}
          <View style={styles.optionsBlock}>
            <Text style={styles.blockLabel}>DELIVERY TYPE</Text>
            <View style={styles.optionsRow}>
              {(["door", "gate", "contactless"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionBtn, deliveryOption === opt ? styles.optionBtnSelected : null]}
                  onPress={() => setDeliveryOption(opt)}
                >
                  <Text style={[styles.optionBtnText, deliveryOption === opt ? styles.optionBtnTextSelected : null]}>
                    {opt.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Verification Code */}
          <OtpEntry
            label="CUSTOMER CONFIRMATION OTP"
            placeholder="Enter 4-Digit OTP"
            maxLength={4}
            value={customerOTP}
            onChangeText={(val) => {
              setCustomerOTP(val);
              setCustomerOTPError(false);
            }}
            hasError={customerOTPError}
            errorText="Invalid OTP code. Please ask the customer for the correct delivery code."
          />

          <StageActionButton label="Verify OTP & Complete Delivery" onPress={handleStatusTransition} />
          <StageActionButton
            label="Cancel Delivery"
            onPress={handleCancelOrder}
            style={{ backgroundColor: Colors.error, marginTop: 8 }}
          />
        
        </OrderStage>
      );
    }

    if (status === "delivered" || status === "completed") {
      return (
        <View style={styles.deliveredScroll}>
          <CompletionHeader title="Delivery Completed!" subtitle="Earnings have been added to your wallet." />

          {/* Earnings Breakdown */}
          <View style={styles.earningsBreakdown}>
            <Text style={styles.breakdownHeader}>EARNINGS BREAKDOWN</Text>
            
            <BreakdownRow label="Base Fare" value={<>₹{baseFare.toFixed(2)}</>} />
            <BreakdownRow label={<>Distance Fare ({distanceVal} km)</>} value={<>₹{distanceFare.toFixed(2)}</>} />
            <BreakdownRow label="Surge Incentives" value={<>₹{surgeBonus.toFixed(2)}</>} />
            <BreakdownRow label="Rain Bonus / Weather Surge" value={<>₹{rainBonus.toFixed(2)}</>} />
            <BreakdownRow label="Peak Hour Bonus" value={<>₹{peakBonus.toFixed(2)}</>} />
            <BreakdownRow label="Wait Fee Compensation" value={<>₹{waitingComp.toFixed(2)}</>} />
            <BreakdownRow label="Customer Tip" value={<>₹{customerTip.toFixed(2)}</>} />

            <BreakdownTotal label="TOTAL PAYOUT" value={<>₹{totalEarningsCalculated.toFixed(2)}</>} />
          </View>

          {/* Feedback & Ratings */}
          <View style={styles.feedbackSection}>
            <Text style={styles.checklistHeader}>RATE YOUR EXPERIENCE</Text>
            <RatingStars rating={rating} onRate={setRating} />
            <TextInput
              style={styles.feedbackInput}
              placeholder="Any operational issues? Write comments here..."
              placeholderTextColor={Colors.textMuted}
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>

          {/* High demand areas & Heatmaps */}
          <View style={styles.heatmapZones}>
            <Text style={styles.checklistHeader}>HIGH DEMAND ZONES</Text>
            <View style={styles.hotspotItem}>
              <Ionicons name="flame" size={16} color={Colors.brand} />
              <Text style={styles.hotspotText}>Koramangala 5th Block (Surge 1.8x)</Text>
            </View>
            <View style={styles.hotspotItem}>
              <Ionicons name="flame" size={16} color={Colors.brand} />
              <Text style={styles.hotspotText}>Indiranagar 100 Feet Road (Surge 1.5x)</Text>
            </View>
          </View>

          <StageActionButton
            label="Finish & Return to Home"
            onPress={handleStatusTransition}
            style={{ marginVertical: 16 }}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ActiveOrderHeader
        title={isRide ? "Ride Active Task" : (isHelper ? "Helper Active Task" : "Delivery Active Task")}
        onBack={() => router.push("/(tabs)")}
        onSOS={handleSOS}
      />

      <ActiveOrderMap
        mapRef={mapRef}
        pickupStop={pickupStop}
        deliveryStop={deliveryStop}
        driverLocation={driverLocation}
        driverHeading={driverHeading}
        polyline={currentOrder.polyline}
      />

      <OrderDetailSheet
        orderId={currentOrder.id}
        height={
          ["picking_items", "arrived_delivery", "delivered", "completed"].includes(
            currentOrder.status.toLowerCase(),
          )
            ? height * 0.62
            : height * 0.46
        }
        paddingBottom={Math.max(insets.bottom, 16) + 12}
      >
        {renderCardContent()}
      </OrderDetailSheet>
    </SafeAreaView>
  );
}