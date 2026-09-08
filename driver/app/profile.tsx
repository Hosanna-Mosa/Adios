import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
} from "react-native";
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

const MENU_ITEMS = [
  {
    section: "Account",
    items: [
      { icon: "user" as const, label: "Personal Info", color: Colors.primary },
      {
        icon: "credit-card" as const,
        label: "Payment Details",
        color: Colors.violet,
      },
      {
        icon: "file-text" as const,
        label: "Documents",
        color: Colors.warning,
      },
    ],
  },
  {
    section: "Address",
    items: [
      {
        icon: "map-pin" as const,
        label: "Saved Addresses",
        color: Colors.tertiary,
        action: "saved-addresses" as const,
      },
    ],
  },
  {
    section: "Vehicle",
    items: [
      { icon: "truck" as const, label: "Vehicle Info", color: Colors.primary },
      {
        icon: "shield" as const,
        label: "Insurance",
        color: Colors.success,
      },
    ],
  },
  {
    section: "Support",
    items: [
      {
        icon: "help-circle" as const,
        label: "Help Center",
        color: Colors.primary,
      },
      {
        icon: "message-circle" as const,
        label: "Contact Support",
        color: Colors.violet,
      },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { driverName, driverPhone, earnings, logout, isOnline } =
    useDriverStore();

  const handleLogout = () => {
    Alert.alert("Go Offline & Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
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
    <ScrollView
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
      <ProfilePageHeader title="Profile" onClose={() => router.back()} />

      <ProfileIdentityCard
        driverName={driverName}
        driverPhone={driverPhone}
        isOnline={isOnline}
      />

      <ProfileStatsRow
        stats={[
          { value: earnings.totalDeliveries, label: "Deliveries" },
          { value: "4.9", label: "Rating" },
          { value: "98%", label: "Acceptance" },
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
            }
          }}
        />
      ))}

      <LogoutButton onPress={handleLogout} />

      <Text style={styles.versionText}>Flavour Driver v1.0.0</Text>
    </ScrollView>
  );
}
