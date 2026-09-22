import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useDriverStore } from "@/store/driverStore";
import {
  EarningsSummaryCard,
  LogoutButton,
  ProfileIdentityCard,
  ProfileMenuSection,
  ProfilePageHeader,
  ProfileStatsRow,
} from "@/features/profile/components";
import { styles } from "@/features/profile/profile.styles";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { AppText } from "@/components/ui/AppText";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { driverName, driverPhone, earnings, logout, isOnline } =
    useDriverStore();

  const MENU_ITEMS = [
    {
      section: t("profile.account"),
      items: [
        { icon: "user" as const, label: t("profile.personalInfo"), color: Colors.primary },
        {
          icon: "credit-card" as const,
          label: t("profile.paymentDetails"),
          color: Colors.violet,
        },
        {
          icon: "file-text" as const,
          label: t("profile.documents"),
          color: Colors.warning,
        },
      ],
    },
    {
      section: t("profile.address"),
      items: [
        {
          icon: "map-pin" as const,
          label: t("profile.savedAddresses"),
          color: Colors.tertiary,
          action: "saved-addresses" as const,
        },
      ],
    },
    {
      section: t("profile.vehicle"),
      items: [
        { icon: "truck" as const, label: t("profile.vehicleInfo"), color: Colors.primary },
        {
          icon: "shield" as const,
          label: t("profile.insurance"),
          color: Colors.success,
        },
      ],
    },
    {
      section: t("support.partnerSupport", "Support"),
      items: [
        {
          icon: "help-circle" as const,
          label: t("profile.helpCenter"),
          color: Colors.primary,
        },
        {
          icon: "message-circle" as const,
          label: t("profile.contactSupport"),
          color: Colors.violet,
        },
        {
          icon: "globe" as const,
          label: t("language.language"),
          color: Colors.tertiary,
          action: "language-settings" as const,
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(t("profile.goOfflineAndLogout"), t("profile.areYouSureYouWantToLogout"), [
      { text: t("actions.cancel"), style: "cancel" },
      {
        text: t("actions.logout"),
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  return (
    <ScrollBox
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ProfilePageHeader title={t("tabs.profile")} onClose={() => router.back()} />

      <ProfileIdentityCard
        driverName={driverName}
        driverPhone={driverPhone}
        isOnline={isOnline}
      />

      <ProfileStatsRow
        stats={[
          { value: earnings.totalDeliveries, label: t("profile.deliveries") },
          { value: "4.9", label: t("profile.rating") },
          { value: "98%", label: t("profile.acceptance") },
        ]}
      />

      <EarningsSummaryCard today={earnings.today} week={earnings.week} />

      {MENU_ITEMS.map((section) => (
        <ProfileMenuSection
          key={section.section}
          title={section.section}
          items={section.items}
          onSelect={(item) => {
            if (item.action === "saved-addresses") {
              router.push("/saved-addresses");
            } else if (item.action === "language-settings") {
              router.push("/language-settings");
            }
          }}
        />
      ))}

      <LogoutButton onPress={handleLogout} />

      <AppText style={styles.versionText}>{t("auth.flavourDriver")} v1.0.0</AppText>
    </ScrollBox>
  );
}
