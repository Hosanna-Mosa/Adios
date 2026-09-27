import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthState } from "@/contexts/authStore";
import { resetSessionExpiry } from "@/contexts/auth.session";
import { trackEvent } from "@/utils/analytics";

// The three credential exchanges: request an OTP, verify one, and sign in with
// a password. Split out of contexts/authStore.ts unchanged — same endpoints,
// same payloads, same error strings.

const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;

type Set = (partial: Partial<AuthState>) => void;

export const createCredentialActions = (set: Set) => ({
  requestOTP: async (phone: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      set({ loading: false });
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      return { success: true, message: data.message };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  verifyOTP: async (phone: string, code: string, role: string, name?: string, email?: string, password?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, role, name, email, password }),
      });
      const data = await response.json();
      set({ loading: false });

      if (!response.ok) throw new Error(data.message || "Verification failed");

      if (data.isNewUser) {
        return { success: true, isNewUser: true };
      }

      resetSessionExpiry();
      set({ user: data.user, token: data.token });
      await Promise.all([
        AsyncStorage.setItem("token", data.token),
        AsyncStorage.setItem("user", JSON.stringify(data.user)),
      ]);
      // The signup screen hands its name through to this same call, so a name
      // here means the account was just created rather than signed back into.
      trackEvent(name ? "sign_up" : "login", { method: "otp" });
      return { success: true, isNewUser: false };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  loginWithPassword: async (phoneOrEmail: string, password: string, role: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/auth/login-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneOrEmail, password, role }),
      });
      const data = await response.json();
      set({ loading: false });

      if (!response.ok) throw new Error(data.message || "Login failed");

      resetSessionExpiry();
      set({ user: data.user, token: data.token });
      await Promise.all([
        AsyncStorage.setItem("token", data.token),
        AsyncStorage.setItem("user", JSON.stringify(data.user)),
      ]);
      trackEvent("login", { method: "password" });
      return { success: true };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },
});
