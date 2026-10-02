import React from "react";
import { useTranslation } from "react-i18next";

import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import { styles } from "../profile-tab.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** Avatar, name, join date and rating at the top of the profile tab. */
export function ProfileHeaderCard({
  name,
  initials,
  profilePic,
  memberSince,
  rating,
}: {
  name: string;
  initials: string;
  profilePic?: string | null;
  memberSince: string;
  rating: number | null;
}) {
  const { t } = useTranslation();
  return (
    <AnimatedBox entering={fadeInUp(0)} style={styles.header}>
      <Box style={styles.avatarWrap}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.avatarImage} contentFit="cover" transition={200} />
        ) : (
          <AppText style={styles.avatarText}>{initials}</AppText>
        )}
        <Box style={styles.onlineDot} />
      </Box>
      <AppText style={styles.name}>{name}</AppText>
      <AppText style={styles.memberSince}>Member since {memberSince}</AppText>
      <Box style={styles.ratingBadge}>
        <Feather name="star" size={11} color={Colors.white} />
        <AppText style={styles.ratingText}>{rating != null ? rating.toFixed(1) : t("profile.newRating")}</AppText>
      </Box>
    </AnimatedBox>
  );
}
