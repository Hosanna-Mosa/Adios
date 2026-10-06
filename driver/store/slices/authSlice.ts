import AsyncStorage from "@react-native-async-storage/async-storage";

import i18n from "@/i18n";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import { trackEvent } from "@/utils/analytics";
import { useLanguageStore } from "@/store/languageStore";
import type { DriverState, GetDriverState, SetDriverState } from "../types";

type Actions = Pick<
  DriverState,
  | "setAuthenticated"
  | "setOnboardingCompleted"
  | "setOnboardingStatus"
  | "setIdentityVerified"
  | "resetOnboarding"
  | "refreshSession"
  | "logout"
  | "loginWithPassword"
>;

export const createAuthSlice = (set: SetDriverState, get: GetDriverState): Actions => ({
  setAuthenticated: (name: string, phone: string, token: string, userId: string) => {
    set({
      isAuthenticated: true,
      driverName: name,
      driverPhone: phone,
      token,
      driverUserId: userId,
    });
    trackEvent("login", { method: "otp" });
  },

  setOnboardingCompleted: () => set({ hasCompletedOnboarding: true }),
  setOnboardingStatus: (status) =>
    set({ onboardingStatus: status, hasCompletedOnboarding: status === "completed" }),
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
          driverEmail: result.account?.email || "",
          driverUserId: result.account?.id || null,
          hasCompletedOnboarding: result.driver?.onboardingStatus === "completed",
          onboardingStatus: result.driver?.onboardingStatus ?? null,
          verificationReview: result.driver?.verificationReview ?? null,
          identityVerified: result.verification?.identity ?? false,
        });

        // The server owns shift status. Reconciling here is what keeps the
        // toggle honest after a reload, and stops a completed ride from
        // leaving the app looking offline while dispatch still has them on.
        const serverOnline = String(result.driver?.status || "").toUpperCase() === "ONLINE";
        const { isOnline, activeServices } = get();
        if (serverOnline && !isOnline) {
          // goOnline, not a bare flag: it also re-establishes the socket the
          // driver needs to actually receive dispatches.
          await get().goOnline(activeServices.length ? activeServices : ["food", "ride"]);
        } else if (!serverOnline && isOnline) {
          set({ isOnline: false });
        }
      }

      return true;
    } catch (error) {
      console.warn("Failed to refresh driver session:", error);
      return Boolean(get().token);
    }
  },

  logout: () => {
    const { token } = get();
    // Best-effort, fire-and-forget: every caller of logout() treats it as
    // synchronous, so this cannot block sign-out on the network. Local
    // sign-out below happens either way — the device must never get stuck
    // signed in because this request failed or the app is offline.
    if (token) {
      fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    AsyncStorage.removeItem("driver-store"); // Clear persistence on logout
    // Keep the persisted language choice; only the in-memory "gate passed"
    // flag resets, so Select Language reappears (pre-selected) before the
    // next login instead of being skipped.
    useLanguageStore.getState().resetLanguageGate();
    set({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      onboardingStatus: null,
      verificationReview: null,
      driverName: "",
      driverPhone: "",
      driverEmail: "",
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
    trackEvent("login", { method: "password" });

    await get().refreshSession();
  },
});
