import { useAuthStore } from "@/contexts/authStore";
import { usePushStore } from "@/contexts/pushStore";
import { logoutSession } from "@/services/auth.service";
import { removePushToken } from "@/services/outlet.service";

jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("@/services/auth.service", () => ({ logoutSession: jest.fn(() => Promise.resolve()) }));
jest.mock("@/services/outlet.service", () => ({ removePushToken: jest.fn(() => Promise.resolve()) }));

const logoutMock = logoutSession as jest.Mock;
const removePushMock = removePushToken as jest.Mock;
const flush = () => new Promise((resolve) => setImmediate(resolve));

const session = { token: "jwt-abc", _id: "v1", name: "Spice Hub", role: "restaurant_vendor" as const };

beforeEach(async () => {
  logoutMock.mockClear();
  removePushMock.mockReset().mockResolvedValue(undefined);
  usePushStore.setState({ permission: "unknown", registeredToken: null });
  useAuthStore.setState({ token: null, partner: null, isInitialized: false });
  await useAuthStore.getState().signIn(session);
});

describe("session", () => {
  it("survives an app restart", async () => {
    useAuthStore.setState({ token: null, partner: null, isInitialized: false });
    await useAuthStore.getState().initializeAuth();
    expect(useAuthStore.getState()).toMatchObject({ token: "jwt-abc", isInitialized: true, partner: { _id: "v1" } });
  });

  it("handles a burst of 401s exactly once", () => {
    const { handleUnauthorized } = useAuthStore.getState();
    expect([handleUnauthorized(), handleUnauthorized(), handleUnauthorized()]).toEqual([true, false, false]);
    expect(useAuthStore.getState().token).toBeNull();
  });
});

describe("signOut", () => {
  it("unregisters this device's push token, then revokes the session — both with the old token", async () => {
    usePushStore.getState().setRegisteredToken("ExponentPushToken[device-1]");
    await useAuthStore.getState().signOut();
    await flush();

    const auth = { authorization: "Bearer jwt-abc" };
    expect(removePushMock).toHaveBeenCalledWith("ExponentPushToken[device-1]", auth);
    expect(logoutMock).toHaveBeenCalledWith(auth);
    expect(removePushMock.mock.invocationCallOrder[0]).toBeLessThan(logoutMock.mock.invocationCallOrder[0]);
    expect(useAuthStore.getState()).toMatchObject({ token: null, partner: null });
    expect(usePushStore.getState().registeredToken).toBeNull();
  });

  it("still revokes the session when unregistering the device fails", async () => {
    usePushStore.getState().setRegisteredToken("ExponentPushToken[device-1]");
    removePushMock.mockRejectedValueOnce(new Error("Network request failed"));
    await useAuthStore.getState().signOut();
    await flush();
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it("skips the push call when this device never registered", async () => {
    await useAuthStore.getState().signOut();
    await flush();
    expect(removePushMock).not.toHaveBeenCalled();
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it("clears the device even if it was already signed out", async () => {
    await useAuthStore.getState().signOut();
    logoutMock.mockClear();
    await useAuthStore.getState().signOut();
    await flush();
    expect(logoutMock).not.toHaveBeenCalled();
  });
});
