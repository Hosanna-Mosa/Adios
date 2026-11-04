import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/**
 * Which services the driver is online for — read-only, from the choice made when
 * going online. It used to be a local "Ride / Delivery" toggle that always started
 * on Ride and changed nothing, so with both services (or only food) chosen it
 * showed the wrong one.
 */
export function ServiceIndicator({ isOnline, activeServices }: { isOnline: boolean; activeServices: ("food" | "ride")[] }) {
  const { t } = useTranslation();
  const rideOn = isOnline && activeServices.includes("ride");
  const foodOn = isOnline && activeServices.includes("food");
  return (
    <Box style={styles.container}>
      <Box style={[styles.option, rideOn ? styles.optionActive : styles.optionInactive]} accessibilityState={{ selected: rideOn }}>
        <MaterialCommunityIcons name="moped" size={18} color={rideOn ? Colors.white : Colors.primary} style={{ marginRight: 8 }} />
        <AppText style={[styles.optionText, rideOn && styles.optionTextActive]}>{t("jobs.rideHailing")}</AppText>
      </Box>

      <Box style={[styles.option, foodOn ? styles.optionActive : styles.optionInactive]} accessibilityState={{ selected: foodOn }}>
        <Feather name="shopping-bag" size={16} color={foodOn ? Colors.white : Colors.primary} style={{ marginRight: 8 }} />
        <AppText style={[styles.optionText, foodOn && styles.optionTextActive]}>{t("jobs.foodDelivery")}</AppText>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  optionActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  optionInactive: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionText: {
    fontWeight: "600",
    fontSize: typography.sizes.medium,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.white,
  },
});
