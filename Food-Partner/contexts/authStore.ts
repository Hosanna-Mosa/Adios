import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PartnerSession } from "@/types/models";
import type { LoginResponse } from "@/services/auth.service";
import { logoutSession } from "@/services/auth.service";
import { removePushToken } from "@/services/outlet.service";
import { usePushStore } from "./pushStore";

// The signed-in outlet. Mirrors the web panel's vendor_token / vendor_data pair
// (admin/src/lib/session.ts), persisted in AsyncStorage instead of localStorage.

const TOKEN_KEY = "partner_token";
const SESSION_KEY = "partner_session";

export interface AuthState {
  token: string | null;
  partner: PartnerSession | null;
  /** True once initializeAuth() has read storage — gates the first redirect. */
  isInitialized: boolean;
  initializeAuth: () => Promise<void>;
  signIn: (response: LoginResponse) => Promise<void>;
  /** Refreshes the saved outlet details with what the database now says (GET /vendors/me). */
  updatePartner: (fields: Partial<Pick<PartnerSession, "name" | "email" | "phone">>) => void;
  signOut: () => Promise<void>;
  /**
   * Called by the HTTP layer's 401 handler. Clears the session and returns true
   * only for the first of a burst of parallel 401s, so the sign-out and the
   * redirect happen exactly once.
   */
  handleUnauthorized: () => boolean;
}

let sessionExpiryHandled = false;

const clearStorage = () =>
  Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(SESSION_KEY)]).catch(() => {});

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  partner: null,
  isInitialized: false,

  initializeAuth: async () => {
    try {
      const [token, raw] = await Promise.all([AsyncStorage.getItem(TOKEN_KEY), AsyncStorage.getItem(SESSION_KEY)]);
      if (token && raw) {
        // An expired token is caught by the first API call's 401, which signs out.
        set({ token, partner: JSON.parse(raw) as PartnerSession });
      }
    } catch (error) {
      console.warn("[auth] Failed to restore the partner session", error);
    } finally {
      set({ isInitialized: true });
    }
  },

  signIn: async ({ token, ...profile }) => {
    sessionExpiryHandled = false;
    const partner: PartnerSession = {
      _id: profile._id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      partnerType: profile.partnerType,
    };
    set({ token, partner });
    await Promise.all([AsyncStorage.setItem(TOKEN_KEY, token), AsyncStorage.setItem(SESSION_KEY, JSON.stringify(partner))]);
  },

  updatePartner: (fields) => {
    const current = get().partner;
    if (!current) return;
    const next = { ...current, ...fields };
    if (next.name === current.name && next.email === current.email && next.phone === current.phone) return;
    set({ partner: next });
    AsyncStorage.setItem(SESSION_KEY, JSON.stringify(next)).catch(() => {});
  },

  signOut: async () => {
    const token = get().token;
    if (token) {
      // Best effort, in order: this device stops ringing for the outlet, then the
      // token is revoked (which would make the first call 401). A device must never
      // get stuck signed in because either failed, so neither is awaited.
      const headers = { authorization: `Bearer ${token}` };
      const pushToken = usePushStore.getState().registeredToken;
      usePushStore.getState().setRegisteredToken(null);
      const stopAlerts = pushToken ? removePushToken(pushToken, headers).catch(() => {}) : Promise.resolve();
      void stopAlerts.then(() => logoutSession(headers)).catch(() => {});
    }
    set({ token: null, partner: null });
    await clearStorage();
  },

  handleUnauthorized: () => {
    if (sessionExpiryHandled || !get().token) return false;
    sessionExpiryHandled = true;
    set({ token: null, partner: null });
    void clearStorage();
    return true;
  },
}));

/** The signed-in outlet. Only call from screens behind the auth gate. */
export const usePartner = () => useAuthStore((s) => s.partner);

export const useIsMeatPartner = () => useAuthStore((s) => s.partner?.role === "meat_vendor");
