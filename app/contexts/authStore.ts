import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// The API URL should be retrieved from app.json/Constants
const apiUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl;

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  /** True once initializeAuth() has completed — used to gate navigation */
  isInitialized: boolean;

  setUser: (user: any) => void;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
  /**
   * Called by the HTTP layer's 401 interceptor. Clears the session, and returns
   * true only for the call that actually did it — so a burst of parallel 401s
   * produces exactly one sign-out and one redirect.
   */
  handleUnauthorized: () => boolean;
  requestOTP: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (phone: string, code: string, role: string, name?: string, email?: string, password?: string) => Promise<{ success: boolean; isNewUser?: boolean }>;
  loginWithPassword: (phoneOrEmail: string, password: string, role: string) => Promise<{ success: boolean }>;
  initializeAuth: () => Promise<void>;
  toggleFavorite: (restaurantId: string) => Promise<void>;
  toggleFavoriteItem: (itemId: string) => Promise<void>;
}

// Guards the one-shot session-expiry path against a redirect storm: several
// in-flight requests can all come back 401 at once. Reset whenever a new token
// is stored, so a later session can expire again.
let sessionExpiryHandled = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  isInitialized: false,

  // Mirrored into AsyncStorage so the cached user initializeAuth() restores on
  // the next cold start isn't a stale copy from sign-in time. Without this,
  // fields edited after sign-in (email, username) came back missing until the
  // profile refetch landed — and stayed missing if it failed.
  setUser: (user) => {
    set({ user });
    if (user) AsyncStorage.setItem("user", JSON.stringify(user)).catch(() => {});
  },

  setToken: (token) => {
    sessionExpiryHandled = false;
    set({ token });
    AsyncStorage.setItem("token", token);
  },

  toggleFavorite: async (restaurantId: string) => {
    const { user, token } = get();
    if (!user) return;
    
    const currentFavorites = user.favorites || [];
    const isFavorite = currentFavorites.includes(restaurantId);
    const newFavorites = isFavorite
      ? currentFavorites.filter((id: string) => id !== restaurantId)
      : [...currentFavorites, restaurantId];
      
    const updatedUser = { ...user, favorites: newFavorites };
    set({ user: updatedUser });
    
    // Attempt to persist local storage
    try {
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update favorites in database
      if (token) {
        await fetch(`${apiUrl}/users/favorites/${restaurantId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.error("Failed to persist favorites", e);
    }
  },

  toggleFavoriteItem: async (itemId: string) => {
    const { user, token } = get();
    if (!user) return;

    const currentFavoriteItems = user.favoriteItems || [];
    const isFavorite = currentFavoriteItems.includes(itemId);
    const newFavoriteItems = isFavorite
      ? currentFavoriteItems.filter((id: string) => id !== itemId)
      : [...currentFavoriteItems, itemId];

    const updatedUser = { ...user, favoriteItems: newFavoriteItems };
    set({ user: updatedUser });

    try {
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      if (token) {
        await fetch(`${apiUrl}/users/favorite-items/${itemId}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.error("Failed to persist favorite items", e);
    }
  },

  /**
   * Called once on app start (inside _layout.tsx).
   * Reads the persisted token & user from AsyncStorage.
   * Sets isInitialized=true when done so the layout can safely redirect.
   */
  initializeAuth: async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("user"),
      ]);

      if (token && userStr) {
        const cachedUser = JSON.parse(userStr);
        set({ token, user: cachedUser });

        try {
          const response = await fetch(`${apiUrl}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            set({ user: data, isInitialized: true });
            await AsyncStorage.setItem("user", JSON.stringify(data));
          } else if (response.status === 401) {
            // 401 is the only status the API uses for a dead session — missing,
            // expired or revoked token, or a user that no longer exists. A 403
            // means authenticated-but-not-permitted and a 404 means the route
            // moved; neither is a reason to throw the session away.
            set({ token: null, user: null, isInitialized: true });
            await Promise.all([
              AsyncStorage.removeItem("token"),
              AsyncStorage.removeItem("user"),
            ]);
          } else {
            set({ isInitialized: true });
          }
        } catch (fetchErr) {
          console.warn("Failed to verify user session with server, using cached session", fetchErr);
          set({ isInitialized: true });
        }
      } else {
        set({ isInitialized: true });
      }
    } catch (err) {
      console.error("Failed to initialize auth", err);
      set({ isInitialized: true }); // still mark done even on error
    }
  },

  handleUnauthorized: () => {
    if (sessionExpiryHandled || !get().token) return false;
    sessionExpiryHandled = true;
    void get().logout();
    return true;
  },

  logout: async () => {
    const { token } = get();

    // Best-effort: tell the server this token is done so it can't be reused
    // if it leaks later. Local sign-out below happens regardless of whether
    // this reaches the server (offline, timeout, already-expired token) —
    // the device must never get stuck signed in because a network call failed.
    if (token) {
      fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    set({ user: null, token: null, error: null, loading: false });
    try {
      await Promise.all([
        AsyncStorage.removeItem("token"),
        AsyncStorage.removeItem("user"),
      ]);
    } finally {
      set({ user: null, token: null, error: null, loading: false });
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, role, name, email, password }),
      });
      const data = await response.json();
      set({ loading: false });

      if (!response.ok) throw new Error(data.message || "Verification failed");

      if (data.isNewUser) {
        return { success: true, isNewUser: true };
      }

      sessionExpiryHandled = false;
      set({ user: data.user, token: data.token });
      await Promise.all([
        AsyncStorage.setItem("token", data.token),
        AsyncStorage.setItem("user", JSON.stringify(data.user)),
      ]);
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

      sessionExpiryHandled = false;
      set({ user: data.user, token: data.token });
      await Promise.all([
        AsyncStorage.setItem("token", data.token),
        AsyncStorage.setItem("user", JSON.stringify(data.user)),
      ]);
      return { success: true };
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

}));
