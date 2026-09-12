import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { emptyProfile, type ProfileResponse } from "../types";
import { useProfileBank } from "./useProfileBank";
import { useProfileEditing } from "./useProfileEditing";
import { useProfilePassword } from "./useProfilePassword";

/** Everything the profile tab does: loading the profile, editing it, changing
 * the password, and adding a bank account.
 *
 * Lifted out of app/(tabs)/profile.tsx unchanged. */
export function useProfileTab() {
  const token = useDriverStore((s) => s.token);
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);
  const logout = useDriverStore((s) => s.logout);
  const [profile, setProfile] = useState<ProfileResponse | null>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Password and bank-account state live in useProfilePassword/useProfileBank
  // below and are spread into this hook's return; the copies that used to sit
  // here were shadowed leftovers from that extraction.

  const loadProfile = useCallback(async (refreshing = false) => {
    if (!apiUrl || !token) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/drivers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only a rejected token signs the driver out. A 404 means the request
      // missed the route (wrong EXPO_PUBLIC_API_URL / stale build), which is a
      // config problem — surface it instead of destroying a valid session.
      if (response.status === 401 || response.status === 403) {
        logout();
        router.replace("/auth");
        return;
      }
      if (response.status === 404) {
        throw new Error("Profile service unavailable. Please try again shortly.");
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load profile");
      setProfile(data);
      if (data.verification?.identity != null) {
        setIdentityVerified(data.verification.identity);
      }
    } catch (error: any) {
      Alert.alert("Profile unavailable", error.message || "Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const initials = useMemo(() => {
    const name = profile?.account.name || "Driver";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.account.name]);

  // ── Enter edit mode ──────────────────────────────────────────────────────
  const editing = useProfileEditing(profile, () => loadProfile());
  const password = useProfilePassword();
  const bank = useProfileBank(() => loadProfile());

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  // ── Sections data ────────────────────────────────────────────────────────

  return {
    profile, isLoading, isRefreshing, loadProfile, initials,
    activeSection, setActiveSection,
    ...editing,
    ...password,
    ...bank,
    handleLogout,
  };
}
