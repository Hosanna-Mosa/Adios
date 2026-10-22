import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthState } from "@/contexts/authStore";
import { resetSessionExpiry } from "@/contexts/auth.session";
import { trackEvent } from "@/utils/analytics";

// The two credential exchanges: create an account and sign in with a password.
// The customer app has no OTP login.

const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;

type Set = (partial: Partial<AuthState>) => void;

export const createCredentialActions = (set: Set) => ({
  register: async (name: string, phone: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await response.json();
      set({ loading: false });
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      resetSessionExpiry();
      set({ user: data.user, token: data.token });
      await Promise.all([
        AsyncStorage.setItem("token", data.token),
        AsyncStorage.setItem("user", JSON.stringify(data.user)),
      ]);
      trackEvent("sign_up", { method: "password" });
      return { success: true };
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
