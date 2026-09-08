import React from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { fadeIn, fadeInUp, usePressScale } from "@/motion/presets";
import { styles } from "./GoOnlineModal.styles";

interface GoOnlineModalProps {
  visible: boolean;
  onClose: () => void;
  onGoOnline: (services: ("food" | "ride")[]) => void;
}

export function GoOnlineModal({ visible, onClose, onGoOnline }: GoOnlineModalProps) {
  const insets = useSafeAreaInsets();
  const [selectedServices, setSelectedServices] = React.useState<("food" | "ride")[]>(["ride", "food"]);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const ridePress = usePressScale(0.98);
  const foodPress = usePressScale(0.98);

  const toggleService = (service: "food" | "ride") => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleGoOnline = () => {
    if (selectedServices.length === 0) return;
    
    // Update the parent's online status immediately so the background changes instantly
    onGoOnline(selectedServices);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setSelectedServices(["ride", "food"]);
    setShowSuccess(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {showSuccess ? (
            <Animated.View entering={fadeInUp(0)} style={styles.successContainer}>
              <View style={styles.successIconWrap}>
                <Feather name="check-circle" size={56} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>You&apos;re Online!</Text>
              <Text style={styles.successText}>
                You&apos;ll receive orders for {selectedServices.join(" & ")}
              </Text>
            </Animated.View>
          ) : (
            <>
              {/* Header */}
              <Text style={styles.title}>Go Online</Text>
              <Text style={styles.subtitle}>
                Select the services you want to be available for
              </Text>

              {/* Service Options */}
              <View style={styles.servicesContainer}>
                <Animated.View style={ridePress.animatedStyle}>
                <Pressable
                  style={[
                    styles.serviceCard,
                    selectedServices.includes("ride") && styles.serviceCardActive,
                  ]}
                  onPress={() => toggleService("ride")}
                  onPressIn={ridePress.onPressIn}
                  onPressOut={ridePress.onPressOut}
                >
                  <View style={styles.serviceLeft}>
                    <View
                      style={[
                        styles.checkbox,
                        selectedServices.includes("ride") && styles.checkboxActive,
                      ]}
                    >
                      {selectedServices.includes("ride") && (
                        <Feather name="check" size={14} color={Colors.white} />
                      )}
                    </View>
                    <View style={styles.serviceInfo}>
                      <View style={styles.serviceIconWrap}>
                        <Feather name="navigation" size={18} color={selectedServices.includes("ride") ? Colors.primary : Colors.textMuted} />
                      </View>
                      <View>
                        <Text style={[styles.serviceName, selectedServices.includes("ride") && styles.serviceNameActive]}>
                          Ride Hailing
                        </Text>
                        <Text style={styles.serviceDesc}>
                          Passenger pick-up & drop-off
                        </Text>
                      </View>
                    </View>
                  </View>
                  {selectedServices.includes("ride") && (
                    <Animated.View entering={fadeIn()} style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>Selected</Text>
                    </Animated.View>
                  )}
                </Pressable>
                </Animated.View>

                <Animated.View style={foodPress.animatedStyle}>
                <Pressable
                  style={[
                    styles.serviceCard,
                    selectedServices.includes("food") && styles.serviceCardActive,
                  ]}
                  onPress={() => toggleService("food")}
                  onPressIn={foodPress.onPressIn}
                  onPressOut={foodPress.onPressOut}
                >
                  <View style={styles.serviceLeft}>
                    <View
                      style={[
                        styles.checkbox,
                        selectedServices.includes("food") && styles.checkboxActive,
                      ]}
                    >
                      {selectedServices.includes("food") && (
                        <Feather name="check" size={14} color={Colors.white} />
                      )}
                    </View>
                    <View style={styles.serviceInfo}>
                      <View style={[styles.serviceIconWrap, styles.serviceIconFood]}>
                        <Feather name="shopping-bag" size={18} color={selectedServices.includes("food") ? Colors.primary : Colors.textMuted} />
                      </View>
                      <View>
                        <Text style={[styles.serviceName, selectedServices.includes("food") && styles.serviceNameActive]}>
                          Food Delivery
                        </Text>
                        <Text style={styles.serviceDesc}>
                          Restaurant orders to customers
                        </Text>
                      </View>
                    </View>
                  </View>
                  {selectedServices.includes("food") && (
                    <Animated.View entering={fadeIn()} style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>Selected</Text>
                    </Animated.View>
                  )}
                </Pressable>
                </Animated.View>
              </View>

              {/* Info note */}
              {selectedServices.length === 0 && (
                <Text style={styles.errorText}>
                  Please select at least one service
                </Text>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title={`Go Online${selectedServices.length > 0 ? ` (${selectedServices.length})` : ""}`}
                  onPress={handleGoOnline}
                  disabled={selectedServices.length === 0}
                  icon={<Feather name="wifi" size={18} color={Colors.onBrand} />}
                  fullWidth
                />
                <Pressable style={styles.cancelBtn} onPress={handleClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
