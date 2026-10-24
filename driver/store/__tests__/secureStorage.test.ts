import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { __resetSecureTokenCache, secureStateStorage } from "../secureStorage";

const KEY = "driver-store";
const persisted = (state: Record<string, unknown>) => JSON.stringify({ state, version: 0 });

beforeEach(async () => {
  await AsyncStorage.clear();
  (SecureStore as any).__reset();
  __resetSecureTokenCache();
  jest.clearAllMocks();
});

describe("secureStateStorage", () => {
  it("writes the token to secure storage and leaves it out of AsyncStorage", async () => {
    await secureStateStorage.setItem(KEY, persisted({ token: "t1", isOnline: true }));

    expect(await SecureStore.getItemAsync("driver-token")).toBe("t1");
    const plain = JSON.parse((await AsyncStorage.getItem(KEY))!);
    expect(plain.state).toEqual({ isOnline: true });
  });

  it("joins the token back in on read", async () => {
    await secureStateStorage.setItem(KEY, persisted({ token: "t1", driverName: "Ravi" }));

    const restored = JSON.parse((await secureStateStorage.getItem(KEY)) as string);
    expect(restored.state).toEqual({ token: "t1", driverName: "Ravi" });
  });

  it("moves a token an older build left in the AsyncStorage JSON, keeping the driver signed in", async () => {
    await AsyncStorage.setItem(KEY, persisted({ token: "legacy", isAuthenticated: true }));

    const restored = JSON.parse((await secureStateStorage.getItem(KEY)) as string);
    expect(restored.state.token).toBe("legacy");
    expect(await SecureStore.getItemAsync("driver-token")).toBe("legacy");
    expect(JSON.parse((await AsyncStorage.getItem(KEY))!).state.token).toBeUndefined();
  });

  it("only writes the Keystore when the token changes", async () => {
    await secureStateStorage.setItem(KEY, persisted({ token: "t1", isOnline: true }));
    await secureStateStorage.setItem(KEY, persisted({ token: "t1", isOnline: false }));
    await secureStateStorage.setItem(KEY, persisted({ token: "t1", activeServices: ["bike"] }));

    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });

  it("deletes the secure token when the store signs out", async () => {
    await secureStateStorage.setItem(KEY, persisted({ token: "t1" }));
    await secureStateStorage.setItem(KEY, persisted({ token: null }));

    expect(await SecureStore.getItemAsync("driver-token")).toBeNull();
  });

  it("removeItem clears both stores", async () => {
    await secureStateStorage.setItem(KEY, persisted({ token: "t1" }));
    await secureStateStorage.removeItem(KEY);

    expect(await AsyncStorage.getItem(KEY)).toBeNull();
    expect(await SecureStore.getItemAsync("driver-token")).toBeNull();
  });
});
