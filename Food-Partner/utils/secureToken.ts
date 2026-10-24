import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

/**
 * The partner session token, kept in the Android Keystore / iOS Keychain
 * instead of AsyncStorage (a plain, unencrypted file). The saved outlet
 * details (partner_session) stay in AsyncStorage — they aren't a credential.
 *
 * Builds before this one kept the token in AsyncStorage under the same key;
 * loadToken() moves it across once, so updating the app doesn't sign anyone out.
 */
const TOKEN_KEY = "partner_token";

// expo-secure-store has no web implementation; web has only AsyncStorage.
const secureAvailable = Platform.OS !== "web";

export async function saveToken(token: string): Promise<void> {
  if (!secureAvailable) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
}

export async function loadToken(): Promise<string | null> {
  if (!secureAvailable) return AsyncStorage.getItem(TOKEN_KEY);

  try {
    const stored = await SecureStore.getItemAsync(TOKEN_KEY);
    if (stored) return stored;
  } catch (error) {
    // An unreadable Keystore entry (e.g. the lock screen was reset) means signed out.
    console.warn("[auth] Secure token unreadable; signing out", error);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    return null;
  }

  const legacy = await AsyncStorage.getItem(TOKEN_KEY);
  if (legacy) {
    try {
      await saveToken(legacy);
    } catch (error) {
      // Keep using it for this run; the move is retried on the next start.
      console.warn("[auth] Could not move token to secure storage", error);
    }
  }
  return legacy;
}

export async function clearToken(): Promise<void> {
  await Promise.all([
    secureAvailable ? SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {}) : Promise.resolve(),
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => {}),
  ]);
}
