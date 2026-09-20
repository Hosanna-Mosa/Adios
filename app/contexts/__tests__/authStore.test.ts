import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@/services/cart.service", () => ({
  getCart: jest.fn(() => Promise.resolve({ vendorId: null, items: [] })),
  putCart: jest.fn(() => Promise.resolve({})),
  clearRemoteCart: jest.fn(() => Promise.resolve({})),
}));
jest.mock("@/utils/api/custom-fetch", () => ({
  customFetch: jest.fn(() => Promise.resolve({})),
  setBaseUrl: jest.fn(),
  setAuthTokenGetter: jest.fn(),
  setUnauthorizedHandler: jest.fn(),
}));

import { useAuthStore } from "../authStore";
import { resetSessionExpiry } from "../auth.session";

beforeEach(async () => {
  await AsyncStorage.clear();
  resetSessionExpiry();
  useAuthStore.setState({ user: null, token: null, loading: false, error: null, isInitialized: false });
});

describe("setToken", () => {
  it("stores the token and mirrors it to storage", async () => {
    useAuthStore.getState().setToken("abc123");

    expect(useAuthStore.getState().token).toBe("abc123");
    expect(await AsyncStorage.getItem("token")).toBe("abc123");
  });
});

describe("setUser", () => {
  it("mirrors the user so a cold start restores the edited copy, not the sign-in one", async () => {
    useAuthStore.getState().setUser({ _id: "u1", name: "Ada" });

    expect(JSON.parse((await AsyncStorage.getItem("user"))!)).toMatchObject({ name: "Ada" });
  });

  it("does not write a null user to storage", async () => {
    useAuthStore.getState().setUser(null);

    expect(await AsyncStorage.getItem("user")).toBeNull();
  });
});

describe("handleUnauthorized", () => {
  it("does nothing when there is no session to expire", () => {
    expect(useAuthStore.getState().handleUnauthorized()).toBe(false);
  });

  it("handles the first 401 and ignores the rest of the storm", () => {
    useAuthStore.getState().setToken("abc123");

    // Several in-flight requests can all come back 401 at once; only the first
    // should trigger the sign-out redirect.
    expect(useAuthStore.getState().handleUnauthorized()).toBe(true);
    expect(useAuthStore.getState().handleUnauthorized()).toBe(false);
    expect(useAuthStore.getState().handleUnauthorized()).toBe(false);
  });

  it("arms again once a new token is stored", () => {
    useAuthStore.getState().setToken("first");
    expect(useAuthStore.getState().handleUnauthorized()).toBe(true);

    useAuthStore.getState().setToken("second");
    expect(useAuthStore.getState().handleUnauthorized()).toBe(true);
  });
});

describe("toggleFavorite", () => {
  it("adds then removes an outlet from the user's favourites", async () => {
    useAuthStore.setState({ user: { _id: "u1", favorites: [] }, token: "t" });

    await useAuthStore.getState().toggleFavorite("r1");
    expect(useAuthStore.getState().user.favorites).toEqual(["r1"]);

    await useAuthStore.getState().toggleFavorite("r1");
    expect(useAuthStore.getState().user.favorites).toEqual([]);
  });

  it("is a no-op when nobody is signed in", async () => {
    await useAuthStore.getState().toggleFavorite("r1");
    expect(useAuthStore.getState().user).toBeNull();
  });
});
