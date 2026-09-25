import React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
              <AppText style={styles.successTitle}>{t("jobs.youreOnline")}</AppText>
              <AppText style={styles.successText}>
                {t("jobs.youllReceiveOrdersFor", {
                  value: selectedServices
                    .map((s) => (s === "ride" ? t("jobs.rideHailing") : t("jobs.foodDelivery")))
                    .join(" & "),
                  defaultValue: "You'll receive orders for {{value}}",
                })}
              </AppText>
            </AnimatedBox>
          ) : (
            <>
              {/* Header */}
              <AppText style={styles.title}>{t("jobs.goOnline")}</AppText>
              <AppText style={styles.subtitle}>
                {t("jobs.selectServicesYouWantToBeAvailableFor")}
              </AppText>

              {/* Service Options */}
              <Box style={styles.servicesContainer}>
                <ServiceOptionCard
                  icon="navigation"
                  name={t("jobs.rideHailing")}
                  description={t("jobs.passengerPickupAndDropoff")}
                  selected={selectedServices.includes("ride")}
                  onToggle={() => toggleService("ride")}
                  press={ridePress}
                />

                <ServiceOptionCard
                  icon="shopping-bag"
                  name={t("jobs.foodDelivery")}
                  description={t("jobs.restaurantOrdersToCustomers")}
                  selected={selectedServices.includes("food")}
                  onToggle={() => toggleService("food")}
                  press={foodPress}
                  iconStyle={styles.serviceIconFood}
                />
              </Box>

              {/* Info note */}
              {selectedServices.length === 0 && (
                <AppText style={styles.errorText}>
                  {t("jobs.pleaseSelectAtLeastOneService")}
                </AppText>
              )}

              {/* Actions */}
              <Box style={styles.actions}>
                <Button
                  title={`${t("jobs.goOnline")}${selectedServices.length > 0 ? ` (${selectedServices.length})` : ""}`}
                  onPress={handleGoOnline}
                  disabled={selectedServices.length === 0}
                  icon={<Feather name="wifi" size={18} color={Colors.onBrand} />}
                  fullWidth
                />
                <PressBox style={styles.cancelBtn} onPress={handleClose}>
                  <AppText style={styles.cancelBtnText}>{t("actions.cancel")}</AppText>
                </PressBox>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </ModalBox>
  );
}
