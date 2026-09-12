import React from "react";

import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { fadeInUp, usePressScale } from "@/motion/presets";
import { ServiceOptionCard } from "./ServiceOptionCard";
import { styles } from "./GoOnlineModal.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { ModalBox } from "@/components/ui/ModalBox";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

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
    <ModalBox
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Box style={styles.overlay}>
        <Box style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
          {/* Handle */}
          <Box style={styles.handleRow}>
            <Box style={styles.handle} />
          </Box>

          {showSuccess ? (
            <AnimatedBox entering={fadeInUp(0)} style={styles.successContainer}>
              <Box style={styles.successIconWrap}>
                <Feather name="check-circle" size={56} color={Colors.success} />
              </Box>
              <AppText style={styles.successTitle}>You&apos;re Online!</AppText>
              <AppText style={styles.successText}>
                You&apos;ll receive orders for {selectedServices.join(" & ")}
              </AppText>
            </AnimatedBox>
          ) : (
            <>
              {/* Header */}
              <AppText style={styles.title}>Go Online</AppText>
              <AppText style={styles.subtitle}>
                Select the services you want to be available for
              </AppText>

              {/* Service Options */}
              <Box style={styles.servicesContainer}>
                <ServiceOptionCard
                  icon="navigation"
                  name="Ride Hailing"
                  description="Passenger pick-up & drop-off"
                  selected={selectedServices.includes("ride")}
                  onToggle={() => toggleService("ride")}
                  press={ridePress}
                />

                <ServiceOptionCard
                  icon="shopping-bag"
                  name="Food Delivery"
                  description="Restaurant orders to customers"
                  selected={selectedServices.includes("food")}
                  onToggle={() => toggleService("food")}
                  press={foodPress}
                  iconStyle={styles.serviceIconFood}
                />
              </Box>

              {/* Info note */}
              {selectedServices.length === 0 && (
                <AppText style={styles.errorText}>
                  Please select at least one service
                </AppText>
              )}

              {/* Actions */}
              <Box style={styles.actions}>
                <Button
                  title={`Go Online${selectedServices.length > 0 ? ` (${selectedServices.length})` : ""}`}
                  onPress={handleGoOnline}
                  disabled={selectedServices.length === 0}
                  icon={<Feather name="wifi" size={18} color={Colors.onBrand} />}
                  fullWidth
                />
                <PressBox style={styles.cancelBtn} onPress={handleClose}>
                  <AppText style={styles.cancelBtnText}>Cancel</AppText>
                </PressBox>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </ModalBox>
  );
}
