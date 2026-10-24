import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { StateStorage } from "zustand/middleware";

/**
 * zustand persist storage that keeps the session token in the Android
 * Keystore / iOS Keychain and everything else (onboarding flags, shift status,
 * chat) in AsyncStorage as before.
 *
 * The persisted JSON is split on write and joined on read, so the rest of the
 * store never knows. Builds before this one wrote the token into the
 * AsyncStorage JSON; the first read moves it across, so updating the app
 * doesn't sign the driver out.
 *
 * The store persists on every state change (location, offers, chat), so the
 * Keystore is only written when the token itself changes.
 */
const TOKEN_KEY = "driver-token";

// expo-secure-store has no web implementation; there the token stays in the JSON.
const secureAvailable = Platform.OS !== "web";

// What the Keystore currently holds, so unchanged tokens skip the write.
// undefined = not known yet (nothing read or written this run).
let lastSecureToken: string | null | undefined;

async function writeSecureToken(token: string | null) {
  if (token === lastSecureToken) return;
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
  lastSecureToken = token;
}

async function readSecureToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    lastSecureToken = token;
    return token;
  } catch (err) {
    // An unreadable Keystore entry (e.g. lock screen reset) means signed out.
    console.warn("Secure token unreadable; signing out", err);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    lastSecureToken = null;
    return null;
  }
}

export const secureStateStorage: StateStorage = {
  getItem: async (name) => {
    const raw = await AsyncStorage.getItem(name);
    if (!secureAvailable) return raw;

    const secureToken = await readSecureToken();
    if (!raw) return null;

    const persisted = JSON.parse(raw);
    const state = persisted?.state ?? {};
    const legacyToken: string | null = state.token ?? null;

    if (secureToken) {
      state.token = secureToken;
    } else if (legacyToken) {
      // First start after the update: move the token out of the plain JSON.
      try {
        await writeSecureToken(legacyToken);
        delete state.token;
        await AsyncStorage.setItem(name, JSON.stringify({ ...persisted, state }));
        state.token = legacyToken;
      } catch (err) {
        console.warn("Could not move token to secure storage", err);
      }
    }
    return JSON.stringify({ ...persisted, state });
  },

  setItem: async (name, value) => {
    if (!secureAvailable) return AsyncStorage.setItem(name, value);

    const persisted = JSON.parse(value);
    const { token = null, ...rest } = persisted?.state ?? {};
    await writeSecureToken(token);
    await AsyncStorage.setItem(name, JSON.stringify({ ...persisted, state: rest }));
  },

  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
    if (secureAvailable) await writeSecureToken(null).catch(() => {});
  },
};

/** For tests: forget what this module believes the Keystore holds. */
export const __resetSecureTokenCache = () => {
  lastSecureToken = undefined;
};
