import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { StateStorage } from "zustand/middleware";

/**
 * zustand persist storage that keeps the session tokens (access and refresh) in the
 * Android Keystore / iOS Keychain and everything else (onboarding flags, shift
 * status, chat) in AsyncStorage as before.
 *
 * The persisted JSON is split on write and joined on read, so the rest of the
 * store never knows. Builds before this one wrote the tokens into the
 * AsyncStorage JSON; the first read moves them across, so updating the app
 * doesn't sign the driver out.
 *
 * The store persists on every state change (location, offers, chat), so the
 * Keystore is only written when a token itself changes.
 */
const SECRET_FIELDS = {
  token: "driver-token",
  refreshToken: "driver-refresh-token",
} as const;
type SecretField = keyof typeof SECRET_FIELDS;
const FIELDS = Object.keys(SECRET_FIELDS) as SecretField[];

// expo-secure-store has no web implementation; there the tokens stay in the JSON.
const secureAvailable = Platform.OS !== "web";

// What the Keystore currently holds, so unchanged tokens skip the write.
// A missing entry = not known yet (nothing read or written this run).
const lastSecure: Partial<Record<SecretField, string | null>> = {};

async function writeSecret(field: SecretField, value: string | null) {
  if (field in lastSecure && value === lastSecure[field]) return;
  if (value) await SecureStore.setItemAsync(SECRET_FIELDS[field], value);
  else await SecureStore.deleteItemAsync(SECRET_FIELDS[field]);
  lastSecure[field] = value;
}

async function readSecret(field: SecretField): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(SECRET_FIELDS[field]);
    lastSecure[field] = value;
    return value;
  } catch (err) {
    // An unreadable Keystore entry (e.g. lock screen reset) means signed out.
    console.warn("Secure token unreadable; signing out", err);
    await SecureStore.deleteItemAsync(SECRET_FIELDS[field]).catch(() => {});
    lastSecure[field] = null;
    return null;
  }
}

export const secureStateStorage: StateStorage = {
  getItem: async (name) => {
    const raw = await AsyncStorage.getItem(name);
    if (!secureAvailable) return raw;

    const secure: Partial<Record<SecretField, string | null>> = {};
    for (const field of FIELDS) secure[field] = await readSecret(field);
    if (!raw) return null;

    const persisted = JSON.parse(raw);
    const state = persisted?.state ?? {};
    let moved = false;

    for (const field of FIELDS) {
      const legacy: string | null = state[field] ?? null;
      if (secure[field]) {
        state[field] = secure[field];
      } else if (legacy) {
        // First start after the update: move the token out of the plain JSON.
        try {
          await writeSecret(field, legacy);
          moved = true;
        } catch (err) {
          console.warn("Could not move token to secure storage", err);
        }
      }
    }
    if (moved) {
      const stripped = { ...state };
      for (const field of FIELDS) if (secure[field] == null && lastSecure[field]) delete stripped[field];
      await AsyncStorage.setItem(name, JSON.stringify({ ...persisted, state: stripped }));
    }
    return JSON.stringify({ ...persisted, state });
  },

  setItem: async (name, value) => {
    if (!secureAvailable) return AsyncStorage.setItem(name, value);

    const persisted = JSON.parse(value);
    const { token = null, refreshToken = null, ...rest } = persisted?.state ?? {};
    await writeSecret("token", token);
    await writeSecret("refreshToken", refreshToken);
    await AsyncStorage.setItem(name, JSON.stringify({ ...persisted, state: rest }));
  },

  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
    if (secureAvailable) {
      for (const field of FIELDS) await writeSecret(field, null).catch(() => {});
    }
  },
};

/** For tests: forget what this module believes the Keystore holds. */
export const __resetSecureTokenCache = () => {
  for (const field of FIELDS) delete lastSecure[field];
};
