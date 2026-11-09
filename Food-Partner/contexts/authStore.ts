import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PartnerSession } from "@/types/models";
import type { LoginResponse } from "@/services/auth.service";
import { logoutSession } from "@/services/auth.service";
import { removePushToken } from "@/services/outlet.service";
import { usePushStore } from "./pushStore";
import { clearRefreshToken, clearToken, loadRefreshToken, loadToken, saveRefreshToken, saveToken } from "@/utils/secureToken";

// The signed-in outlet. Mirrors the web panel's vendor_token / vendor_data pair
// (admin/src/lib/session.ts): the token in secure storage (utils/secureToken.ts),
// the outlet details in AsyncStorage.

const SESSION_KEY = "partner_session";

export interface AuthState {
  token: string | null;
  /** One-use token that renews `token` when it expires (see utils/api/sessionRefresh.ts). */
  refreshToken: string | null;
  partner: PartnerSession | null;
  /** True once initializeAuth() has read storage — gates the first redirect. */
  isInitialized: boolean;
  initializeAuth: () => Promise<void>;
  signIn: (response: LoginResponse) => Promise<void>;
  /** Stores a renewed token pair after a silent refresh. */
  setTokens: (tokens: { token: string; refreshToken: string }) => Promise<void>;
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
  Promise.all([clearToken(), clearRefreshToken(), AsyncStorage.removeItem(SESSION_KEY)]).catch(() => {});

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  partner: null,
  isInitialized: false,

  initializeAuth: async () => {
    try {
      const [token, raw, refreshToken] = await Promise.all([
        loadToken(),
        AsyncStorage.getItem(SESSION_KEY),
        loadRefreshToken(),
      ]);
      if (token && raw) {
        // An expired token is renewed by the first API call's 401 (or, if that fails, signs out).
        set({ token, refreshToken, partner: JSON.parse(raw) as PartnerSession });
      }
    } catch (error) {
      console.warn("[auth] Failed to restore the partner session", error);
    } finally {
      set({ isInitialized: true });
    }
  },

  signIn: async ({ token, refreshToken, ...profile }) => {
    sessionExpiryHandled = false;
    const partner: PartnerSession = {
      _id: profile._id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      partnerType: profile.partnerType,
    };
    set({ token, refreshToken: refreshToken ?? null, partner });
    await Promise.all([
      saveToken(token),
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(partner)),
      refreshToken ? saveRefreshToken(refreshToken) : clearRefreshToken(),
    ]);
  },

  setTokens: async ({ token, refreshToken }) => {
    set({ token, refreshToken });
    await Promise.all([saveToken(token), saveRefreshToken(refreshToken)]);
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
    const { token, refreshToken } = get();
    if (token) {
      // Best effort, in order: this device stops ringing for the outlet, then the
      // token is revoked (which would make the first call 401). A device must never
      // get stuck signed in because either failed, so neither is awaited.
      const headers = { authorization: `Bearer ${token}` };
      const pushToken = usePushStore.getState().registeredToken;
      usePushStore.getState().setRegisteredToken(null);
      const stopAlerts = pushToken ? removePushToken(pushToken, headers).catch(() => {}) : Promise.resolve();
      void stopAlerts.then(() => logoutSession(headers, refreshToken)).catch(() => {});
    }
    set({ token: null, refreshToken: null, partner: null });
    await clearStorage();
  },

  handleUnauthorized: () => {
    if (sessionExpiryHandled || !get().token) return false;
    sessionExpiryHandled = true;
    set({ token: null, refreshToken: null, partner: null });
    void clearStorage();
    return true;
  },
}));

/** The signed-in outlet. Only call from screens behind the auth gate. */
export const usePartner = () => useAuthStore((s) => s.partner);

export const useIsMeatPartner = () => useAuthStore((s) => s.partner?.role === "meat_vendor");
