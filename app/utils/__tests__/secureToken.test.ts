import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { clearToken, loadToken, saveToken } from "../secureToken";

beforeEach(async () => {
  await AsyncStorage.clear();
  (SecureStore as any).__reset();
  jest.clearAllMocks();
});

describe("secureToken", () => {
  it("saves to secure storage and nowhere else", async () => {
    await saveToken("t1");

    expect(await SecureStore.getItemAsync("token")).toBe("t1");
    expect(await AsyncStorage.getItem("token")).toBeNull();
    expect(await loadToken()).toBe("t1");
  });

  it("moves a token left in AsyncStorage by an older build, keeping the user signed in", async () => {
    await AsyncStorage.setItem("token", "legacy");

    expect(await loadToken()).toBe("legacy");
    expect(await SecureStore.getItemAsync("token")).toBe("legacy");
    expect(await AsyncStorage.getItem("token")).toBeNull();
  });

  it("returns null when nothing is stored", async () => {
    expect(await loadToken()).toBeNull();
  });

  it("treats an unreadable Keystore entry as signed out instead of throwing", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error("KeyStore corrupted"));

    expect(await loadToken()).toBeNull();
  });

  it("clears both stores", async () => {
    await saveToken("t1");
    await AsyncStorage.setItem("token", "legacy");
    await clearToken();

    expect(await SecureStore.getItemAsync("token")).toBeNull();
    expect(await AsyncStorage.getItem("token")).toBeNull();
  });
});
