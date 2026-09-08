import React, { useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";

import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { Header } from "@/components/ui/Header";
import { createStyles } from "@/features/profile/profile.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { AppTabBar, useAppTabBarHeight } from "@/components/AppTabBar";
import { fadeInDown, fadeInUp } from "@/motion/presets";

import { ProfileSignOutAllBtn } from "@/features/profile/components/ProfileSignOutAllBtn";
import { ProfileSignOutBtn } from "@/features/profile/components/ProfileSignOutBtn";
import { ProfileMenuCard } from "@/features/profile/components/ProfileMenuCard";
import { ProfileStatsRow } from "@/features/profile/components/ProfileStatsRow";
import { ProfileProfileCard } from "@/features/profile/components/ProfileProfileCard";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { SecuritySheet } from "@/features/profile/components/SecuritySheet";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { user, logout, setUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [loading, setLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const [securityVisible, setSecurityVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      customFetch<{ unreadCount: number }>("/notifications/unread-count")
        .then((res) => setUnreadCount(res?.unreadCount || 0))
        .catch(() => {});
    }, [])
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await customFetch<any>("/users/profile");
      if (data) setUser(data);
      try {
        const ordersData = await customFetch<any[]>("/orders");
        if (ordersData && Array.isArray(ordersData)) {
          setOrdersCount(ordersData.length);
          setTotalSpent(ordersData.reduce((sum, o) => sum + (o.totalPrice || 0), 0));
        }
      } catch (orderErr) {
        console.warn("Failed to fetch user orders:", orderErr);
      }
    } catch (err: any) {
      // A dead session is handled centrally: customFetch's 401 interceptor
      // clears the store and redirects once, so this must not navigate too.
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0].uri) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const fd = new FormData();
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : "image";
      fd.append("image", { uri, name: filename, type } as any);
      const data = await customFetch<any>("/users/profile-pic", { method: "POST", body: fd, isFormData: true });
      if (data && data.user) setUser(data.user);
    } catch (err) {
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing fields", "All fields are required");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Weak password", "New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Doesn't match", "Passwords do not match");
      return;
    }
    try {
      setChangingPassword(true);
      // customFetch rather than a hand-built fetch, so an expired session here
      // goes through the same 401 interceptor as every other call.
      await customFetch("/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      Alert.alert("Success", "Password changed successfully.");
      setSecurityVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOutAllDevices = () => {
    Alert.alert(
      "Sign out of all devices?",
      "Every phone signed in to this account gets signed out, including this one.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out everywhere",
          style: "destructive",
          onPress: async () => {
            try {
              setSigningOutAll(true);
              await customFetch("/auth/logout-all", { method: "POST" });
            } catch (err: any) {
              console.error("Sign out of all devices error:", err);
              Alert.alert("Error", err?.message || "Couldn't sign out of all devices.");
              setSigningOutAll(false);
              return;
            }
            await logout();
            setSigningOutAll(false);
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const memberSinceYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : null;

  const MENU_ITEMS = [
    { key: "orders", icon: "receipt", label: "My orders", onPress: () => router.push("/(tabs)/orders") },
    { key: "personal", icon: "person-circle", label: "Personal details", onPress: () => router.push("/personal-details") },
    { key: "places", icon: "location", label: "Places", badge: user?.addresses?.length ? String(user.addresses.length) : undefined, onPress: () => router.push("/delivery/saved-addresses") },
    { key: "favorites", icon: "heart", label: "Favorites", badge: user?.favorites?.length ? String(user.favorites.length) : undefined, onPress: () => router.push("/favorites") },
    { key: "notifications", icon: "notifications", label: "Notifications", countBadge: unreadCount > 0 ? unreadCount : undefined, onPress: () => router.push("/notifications") },
    { key: "security", icon: "shield-checkmark", label: "Security", onPress: () => setSecurityVisible(true) },
    { key: "support", icon: "mail", label: "Help & support", onPress: () => router.push("/support") },
  ] as const;

  return (
    <ScreenShell>
      <Header
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        style={{ paddingTop: insets.top + 12 }}
        entering={fadeInDown(0)}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: tabBarHeight + 24 }} showsVerticalScrollIndicator={false}>
        <ProfileProfileCard
          handlePickImage={handlePickImage}
          styles={styles}
          user={user}
        />

        <ProfileStatsRow
          memberSinceYear={memberSinceYear}
          ordersCount={ordersCount}
          styles={styles}
          totalSpent={totalSpent}
        />

        <ProfileMenuCard
          MENU_ITEMS={MENU_ITEMS}
          accent={accent}
          styles={styles}
          theme={theme}
          toggleTheme={toggleTheme}
          tokens={tokens}
        />

        <Animated.View entering={fadeInUp(280)}>
          <ProfileSignOutBtn
            handleLogout={handleLogout}
            loading={loading}
            styles={styles}
            tokens={tokens}
          />
          <ProfileSignOutAllBtn
            handleSignOutAllDevices={handleSignOutAllDevices}
            loading={loading}
            signingOutAll={signingOutAll}
            styles={styles}
            tokens={tokens}
          />
        </Animated.View>
      </ScrollView>

      <AppTabBar active="account" />

      {/* Security modal */}
      <SecuritySheet
        accent={accent}
        changingPassword={changingPassword}
        confirmPassword={confirmPassword}
        currentPassword={currentPassword}
        handleChangePassword={handleChangePassword}
        newPassword={newPassword}
        securityVisible={securityVisible}
        setConfirmPassword={setConfirmPassword}
        setCurrentPassword={setCurrentPassword}
        setNewPassword={setNewPassword}
        setSecurityVisible={setSecurityVisible}
        styles={styles}
        tokens={tokens}
      />
    </ScreenShell>
  );
}
