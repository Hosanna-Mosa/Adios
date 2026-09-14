import React, { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { createStyles } from "./profile.styles";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { customFetch } from "@/utils/api/custom-fetch";
import { useAppTabBarHeight } from "@/components/AppTabBar";

// Part 1 of useProfile, kept under the 150-line file limit. The parts run in
// the order they were written, so React sees the same hook sequence.

export function useProfileInsets() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useAppTabBarHeight();
  const { user, logout, setUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = { accent: tokens.brand, skin: tokens.brandSkin, on: tokens.onBrand };
  const styles = useMemo(() => createStyles(tokens, accent), [theme]);

  const [loading, setLoading] = useState(false);
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
    } catch (err: any) {
      // A dead session is handled centrally: customFetch's 401 interceptor
      // clears the store and redirects once, so this must not navigate too.
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { insets, tabBarHeight, user, logout, setUser, theme, toggleTheme, tokens, accent, styles, loading, setLoading, unreadCount, securityVisible, setSecurityVisible, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, changingPassword, setChangingPassword, signingOutAll, setSigningOutAll };
}
