import React from "react";
import { useTranslation } from "react-i18next";

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { styles } from "./HighDemandAreas.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Loader } from "@/components/ui/Loader";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

export interface Hotspot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  surge: string;
  orderCount?: number;
}

interface HighDemandAreasProps {
  hotspots: Hotspot[];
  isLoading?: boolean;
  onAreaPress?: (area: Hotspot) => void;
}

export function HighDemandAreas({ hotspots, isLoading = false, onAreaPress }: HighDemandAreasProps) {
  const { t } = useTranslation();
  return (
    <Box style={styles.section}>
      <Box style={styles.header}>
        <AppText style={styles.sectionTitle}>{t("jobs.highDemandAreas")}</AppText>
        <Touchable style={styles.viewAllBtn}>
          <AppText style={styles.viewAllText}>{t("jobs.viewAll")}</AppText>
          <Feather name="chevron-right" size={14} color={Colors.primary} />
        </Touchable>
      </Box>
      <Box style={styles.hotspotList}>
        {isLoading && (
          <Box style={styles.loadingItem}>
            <Loader size="small" color={Colors.primary} />
          </Box>
        )}
        {!isLoading && hotspots.length === 0 && (
          <Box style={styles.loadingItem}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={20} color={Colors.textMuted} />
            <AppText style={styles.emptyText}>{t("jobs.noHighDemandAreas")}</AppText>
          </Box>
        )}
        {hotspots.map((spot) => (
          <PressBox
            key={spot.id}
            style={styles.hotspotItem}
            onPress={() => onAreaPress?.(spot)}
          >
            <Box style={styles.iconContainer}>
              <Box style={styles.iconCircle}>
                <MaterialCommunityIcons name="map-marker" size={16} color={Colors.primary} />
              </Box>
            </Box>
            <Box style={styles.hotspotCopy}>
              <AppText style={styles.hotspotName} numberOfLines={1}>
                {spot.name}
              </AppText>
              <AppText style={styles.hotspotAddress} numberOfLines={1}>
                {spot.address}
              </AppText>
            </Box>
            <Box style={styles.surgeChip}>
              <AppText style={styles.surgeChipText}>{spot.surge}</AppText>
            </Box>
            <Feather name="chevron-right" size={20} color={Colors.textSecondary} />
          </PressBox>
        ))}
      </Box>
    </Box>
  );
}
