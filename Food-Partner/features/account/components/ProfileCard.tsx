import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { InfoRow } from "@/components/ui/InfoRow";
import { designTokens, elevation, gradients, radius, type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { fadeInUp } from "@/motion/presets";

interface Props {
  name: string;
  image?: string;
  address?: string;
  email?: string;
  phone?: string;
  isMeat: boolean;
}

/** The signed-in outlet as the database has it: photo, name, type, address and contact details. */
export function ProfileCard({ name, image, address, email, phone, isMeat }: Props) {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <Animated.View entering={fadeInUp(0)} style={styles.card}>
      <LinearGradient colors={gradients[theme][isMeat ? "meat" : "brand"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner} />
      <View style={styles.body}>
        <Avatar name={name} imageUri={image} size={68} style={styles.avatar} initialStyle={{ color: isMeat ? tokens.services.meat.accent : tokens.brand }} />
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Badge label={isMeat ? t("roles.meatCenter") : t("roles.restaurant")} tone={isMeat ? "meat" : "brand"} icon={isMeat ? "storefront" : "restaurant"} />
        <View style={styles.contacts}>
          {address ? <InfoRow icon="location-outline" text={address} /> : null}
          {email ? <InfoRow icon="mail-outline" text={email} /> : null}
          {phone ? <InfoRow icon="call-outline" text={phone} /> : null}
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: tokens.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: tokens.border,
      overflow: "hidden",
      ...elevation.sm,
    },
    banner: { height: 64 },
    body: { paddingHorizontal: 16, paddingBottom: 16, gap: 8, marginTop: -34 },
    avatar: {
      backgroundColor: tokens.surface,
      borderWidth: 3,
      borderColor: tokens.surface,
    },
    name: {
      fontFamily: fontFamilies.heading.semibold,
      fontSize: typography.sizes.large,
      lineHeight: typography.lineHeights.large,
      color: tokens.text,
      marginTop: 4,
    },
    contacts: { gap: 8, marginTop: 6 },
  });
