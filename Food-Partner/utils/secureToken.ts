import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

/**
 * The session tokens (access and refresh), kept in the Android Keystore / iOS Keychain
 * instead of AsyncStorage (a plain, unencrypted file any rooted device or backup can read).
 * The cached user profile stays in AsyncStorage — it isn't a credential.
 *
 * Builds before this one kept the tokens in AsyncStorage under the same keys;
 * a load moves them across once, so updating the app doesn't sign anyone out.
 */
const TOKEN_KEY = "partner_token";
const REFRESH_KEY = "partner_refresh_token";

// expo-secure-store has no web implementation; web has only AsyncStorage.
const secureAvailable = Platform.OS !== "web";

async function save(key: string, value: string): Promise<void> {
  if (!secureAvailable) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
  await AsyncStorage.removeItem(key).catch(() => {});
}

async function load(key: string): Promise<string | null> {
  if (!secureAvailable) return AsyncStorage.getItem(key);

  try {
    const stored = await SecureStore.getItemAsync(key);
    if (stored) return stored;
  } catch (err) {
    // The Keystore can become unreadable (e.g. the device's lock screen was
    // reset). Treat it as signed out rather than crash start-up.
    console.warn("Secure token unreadable; signing out", err);
    await SecureStore.deleteItemAsync(key).catch(() => {});
    return null;
  }

  const legacy = await AsyncStorage.getItem(key);
  if (legacy) {
    try {
      await save(key, legacy);
    } catch (err) {
      // Keep using it for this run; the move is retried on the next start.
      console.warn("Could not move token to secure storage", err);
    }
  }
  return legacy;
}

async function clear(key: string): Promise<void> {
  await Promise.all([
    secureAvailable ? SecureStore.deleteItemAsync(key).catch(() => {}) : Promise.resolve(),
    AsyncStorage.removeItem(key).catch(() => {}),
  ]);
}

export const saveToken = (token: string) => save(TOKEN_KEY, token);
export const loadToken = () => load(TOKEN_KEY);
export const clearToken = () => clear(TOKEN_KEY);
export const saveRefreshToken = (token: string) => save(REFRESH_KEY, token);
export const loadRefreshToken = () => load(REFRESH_KEY);
export const clearRefreshToken = () => clear(REFRESH_KEY);
