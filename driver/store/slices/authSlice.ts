import AsyncStorage from "@react-native-async-storage/async-storage";

import i18n from "@/i18n";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { useLanguageStore } from "@/store/languageStore";
import type { DriverState, GetDriverState, SetDriverState } from "../types";

type Actions = Pick<
  DriverState,
  | "setAuthenticated"
  | "setOnboardingCompleted"
  | "setIdentityVerified"
  | "resetOnboarding"
  | "refreshSession"
  | "logout"
  | "loginWithPassword"
>;

export const createAuthSlice = (set: SetDriverState, get: GetDriverState): Actions => ({
  setAuthenticated: (name: string, phone: string, token: string, userId: string) =>
    set({
      isAuthenticated: true,
      driverName: name,
      driverPhone: phone,
      token,
      driverUserId: userId,
    }),

  setOnboardingCompleted: () => set({ hasCompletedOnboarding: true }),
  setIdentityVerified: (verified) => set({ identityVerified: verified }),
  resetOnboarding: () => set({ hasCompletedOnboarding: false, isOnline: false }),

  refreshSession: async () => {
    const { token, isAuthenticated } = get();
    if (!token) {
      if (isAuthenticated) get().logout();
      return false;
    }

    try {
      const res = await fetch(`${apiUrl}/drivers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 401/403 mean this token is genuinely rejected — sign out.
      // A 404 does NOT: it means the request never reached the profile
      // route (wrong EXPO_PUBLIC_API_URL, missing /api/v1 prefix, a stale
      // build). Destroying a valid session over a config mistake logged
      // drivers out on every launch, so treat it like a network failure
      // and keep whatever token we hold.
      if (res.status === 401 || res.status === 403) {
        get().logout();
        return false;
      }

      if (res.status === 404) {
        console.warn(
          `Driver profile route not found at ${apiUrl}/drivers/profile — ` +
            "check EXPO_PUBLIC_API_URL. Keeping the existing session.",
        );
        return Boolean(get().token);
      }

      if (res.ok) {
        const result = await res.json();
        set({
          driverName: result.account?.name || "",
          driverPhone: result.account?.phone || "",
          driverUserId: result.account?.id || null,
          hasCompletedOnboarding: result.driver?.onboardingStatus === "completed",
          identityVerified: result.verification?.identity ?? false,
        });
      }

      return true;
    } catch (error) {
      console.warn("Failed to refresh driver session:", error);
      return Boolean(get().token);
    }
  },

  logout: () => {
    AsyncStorage.removeItem("driver-store"); // Clear persistence on logout
    // Keep the persisted language choice; only the in-memory "gate passed"
    // flag resets, so Select Language reappears (pre-selected) before the
    // next login instead of being skipped.
    useLanguageStore.getState().resetLanguageGate();
    set({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      driverName: "",
      driverPhone: "",
      driverUserId: null,
      token: null,
      isOnline: false,
      currentOrder: null,
      incomingOrder: null,
    });
  },

  loginWithPassword: async (phone: string, password: string) => {
    const response = await fetch(`${apiUrl}/auth/login-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password, role: "DRIVER" }),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(data.message || i18n.t("auth.loginFailed"));

    set({
      isAuthenticated: true,
      driverName: data.user.name,
      driverPhone: data.user.phone,
      driverUserId: data.user.id || data.user._id,
      token: data.token,
    });

    await get().refreshSession();
  },
});
