import React from "react";
import { useTranslation } from "react-i18next";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Dev panel that fakes driver movement toward a stop.
 *
 * This markup was written out four times across the order stages, differing
 * only in the fallback ETA/distance shown when the simulator is idle and in
 * which stop it drives toward. */
export function GpsSimulatorPanel({
  isSimulating,
  speed,
  eta,
  remainingDistance,
  idleEta,
  idleDistance,
  onToggle,
}: {
  isSimulating: boolean;
  speed: number | string;
  eta: number | string;
  remainingDistance: number | string;
  idleEta?: string;
  idleDistance?: string;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.simPanel}>
      <Box style={styles.simStatsRow}>
        <Box style={styles.simStatItem}>
          <AppText style={styles.simStatLabel}>{t("jobs.speed")}</AppText>
          <AppText style={styles.simStatValue}>{isSimulating ? `${speed} km/h` : "0 km/h"}</AppText>
        </Box>
        <Box style={styles.simStatItem}>
          <AppText style={styles.simStatLabel}>{t("jobs.eta")}</AppText>
          <AppText style={styles.simStatValue}>{isSimulating ? `${eta} min` : idleEta}</AppText>
        </Box>
        <Box style={styles.simStatItem}>
          <AppText style={styles.simStatLabel}>{t("jobs.distance")}</AppText>
          <AppText style={styles.simStatValue}>
            {isSimulating ? `${remainingDistance} km` : idleDistance}
          </AppText>
        </Box>
      </Box>
      <Touchable
        style={[styles.simToggleBtn, isSimulating ? styles.simToggleBtnActive : null]}
        onPress={onToggle}
      >
        <Ionicons name={isSimulating ? "pause" : "navigate"} size={16} color={Colors.white} />
        <AppText style={styles.simToggleText}>
          {isSimulating ? t("jobs.stopGpsSimulator") : t("jobs.simulateTravelCoordinates")}
        </AppText>
      </Touchable>
    </Box>
  );
}
