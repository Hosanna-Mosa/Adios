import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { clearToken, loadToken, saveToken } from "@/utils/secureToken";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("expo-secure-store", () => {
  let store: Record<string, string> = {};
  return {
    __reset: () => {
      store = {};
    },
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    getItemAsync: jest.fn(async (key: string) => store[key] ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      delete store[key];
    }),
  };
});

beforeEach(async () => {
  await AsyncStorage.clear();
  (SecureStore as any).__reset();
  jest.clearAllMocks();
});

describe("secureToken", () => {
  it("saves to secure storage and nowhere else", async () => {
    await saveToken("jwt-1");
    expect(await SecureStore.getItemAsync("partner_token")).toBe("jwt-1");
    expect(await AsyncStorage.getItem("partner_token")).toBeNull();
  });

  it("moves a token an older build left in AsyncStorage, keeping the outlet signed in", async () => {
    await AsyncStorage.setItem("partner_token", "legacy");
    expect(await loadToken()).toBe("legacy");
    expect(await SecureStore.getItemAsync("partner_token")).toBe("legacy");
    expect(await AsyncStorage.getItem("partner_token")).toBeNull();
  });

  it("treats an unreadable Keystore entry as signed out", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error("KeyStore corrupted"));
    expect(await loadToken()).toBeNull();
  });

  it("clears both stores", async () => {
    await saveToken("jwt-1");
    await AsyncStorage.setItem("partner_token", "legacy");
    await clearToken();
    expect(await SecureStore.getItemAsync("partner_token")).toBeNull();
    expect(await AsyncStorage.getItem("partner_token")).toBeNull();
  });
});
