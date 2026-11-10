import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthState } from "@/contexts/authStore";
import { resetSessionExpiry } from "@/contexts/auth.session";
import { trackEvent } from "@/utils/analytics";
import { clearRefreshToken, saveRefreshToken, saveToken } from "@/utils/secureToken";
import { AUTH_REFRESH_HEADER } from "@/utils/api/sessionRefresh";

// The three credential exchanges: request an OTP, verify one, and sign in with
// a password. Split out of contexts/authStore.ts unchanged — same endpoints,
// same payloads, same error strings.

const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;

type Set = (partial: Partial<AuthState>) => void;

/**
 * Saves the session for the next launch. The customer is already signed in by the time
 * this runs, so a full or failing disk must not turn a good login into a "Login failed"
 * alert — it only means signing in again after the app is closed.
 */
async function persistSession(token: string, user: unknown, refreshToken?: string | null) {
  try {
    await Promise.all([
      saveToken(token),
      AsyncStorage.setItem("user", JSON.stringify(user)),
      refreshToken ? saveRefreshToken(refreshToken) : clearRefreshToken(),
    ]);
  } catch (err) {
    console.warn("Could not save the session to device storage:", err);
  }
}

/** Stores a signed-in session in the store and on disk. */
async function saveSession(set: Set, data: { user: any; token: string; refreshToken?: string }) {
  resetSessionExpiry();
  set({ user: data.user, token: data.token, refreshToken: data.refreshToken ?? null });
  await persistSession(data.token, data.user, data.refreshToken);
}

/** POSTs to an /auth endpoint and returns the parsed body, throwing the server's message on failure. */
async function postAuth(path: string, body: object, fallback: string) {
  const response = await fetch(`${apiUrl}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...AUTH_REFRESH_HEADER },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || fallback);
  return data;
}


export const createCredentialActions = (set: Set) => ({
  /** Emails a 6-digit login code to the address. */
  requestEmailOTP: async (email: string) => {
    set({ loading: true, error: null });
    try {
      const data = await postAuth("request-email-otp", { email }, "Something went wrong");
      set({ loading: false });
      return { success: true, message: data.message as string };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  /** Checks the emailed code: signs an existing account in, or returns a sign-up ticket for a new address. */
  verifyEmailOTP: async (email: string, code: string) => {
    set({ loading: true, error: null });
    try {
      const data = await postAuth("verify-email-otp", { email, code }, "Verification failed");
      if (data.isNewUser) {
        set({ loading: false });
        return { success: true, isNewUser: true, ticket: data.ticket as string };
      }
      await saveSession(set, data);
      set({ loading: false });
      trackEvent("login", { method: "email_otp" });
      return { success: true, isNewUser: false };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  /** Finishes a sign-up with a ticket from a verified phone (needs `name`) or email (needs `phone`). */
  completeSignup: async (ticket: string, input: { name?: string; phone?: string }, method: "otp" | "email_otp") => {
    set({ loading: true, error: null });
    try {
      const data = await postAuth("complete-signup", { ticket, ...input }, "Couldn't create your account");
      await saveSession(set, data);
      set({ loading: false });
      trackEvent("sign_up", { method });
      return { success: true };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

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
        headers: { "Content-Type": "application/json", ...AUTH_REFRESH_HEADER },
        body: JSON.stringify({ phone, code, role, name, email, password }),
      });
      const data = await response.json();
      set({ loading: false });

      if (!response.ok) throw new Error(data.message || "Verification failed");

      if (data.isNewUser) {
        return { success: true, isNewUser: true, ticket: data.ticket as string | undefined };
      }

      resetSessionExpiry();
      set({ user: data.user, token: data.token, refreshToken: data.refreshToken ?? null });
      await persistSession(data.token, data.user, data.refreshToken);
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
        headers: { "Content-Type": "application/json", ...AUTH_REFRESH_HEADER },
        body: JSON.stringify({ phone: phoneOrEmail, password, role }),
      });
      const data = await response.json();
      set({ loading: false });

      if (!response.ok) throw new Error(data.message || "Login failed");

      resetSessionExpiry();
      set({ user: data.user, token: data.token, refreshToken: data.refreshToken ?? null });
      await persistSession(data.token, data.user, data.refreshToken);
      trackEvent("login", { method: "password" });
      return { success: true };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },
});
