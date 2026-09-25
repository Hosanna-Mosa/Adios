import React from "react";
import { useTranslation } from "react-i18next";

import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Avatar initials, name, phone, and the online/offline badge. */
export function ProfileIdentityCard({
  driverName,
  driverPhone,
  isOnline,
}: {
  driverName?: string | null;
  driverPhone?: string | null;
  isOnline: boolean;
}) {
  const { t } = useTranslation();
  const initials = driverName
    ? driverName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "DR";

  return (
    <Box style={styles.profileCard}>
      <Box style={styles.avatarContainer}>
        <AppText style={styles.avatarText}>{initials}</AppText>
      </Box>
      <Box style={styles.profileInfo}>
        <AppText style={styles.profileName}>{driverName || t("profile.driver")}</AppText>
        <AppText style={styles.profilePhone}>{driverPhone || "+91 XXXXX XXXXX"}</AppText>
        <Box
          style={[
            styles.statusBadge,
            { backgroundColor: isOnline ? Colors.successLight : Colors.surfaceAlt },
          ]}
        >
          <Box
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? Colors.success : Colors.textMuted },
            ]}
          />
          <AppText
            style={[
              styles.statusText,
              { color: isOnline ? Colors.success : Colors.textMuted },
            ]}
          >
            {isOnline ? t("profile.online") : t("profile.offline")}
          </AppText>
        </Box>
      </Box>
    </Box>
  );
}
