// The checks every order flow runs before charging: a signed-in customer, and a driver online.

const mockPush = jest.fn();
const mockShowAlert = jest.fn();
const mockGetNearbyDrivers = jest.fn();
let mockAuth: { user: any; token: string | null } = { user: null, token: null };

jest.mock("expo-router", () => ({ router: { push: (...a: any[]) => mockPush(...a) } }));
jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));
jest.mock("@/components/ui/AppAlert", () => ({ showAlert: (...a: any[]) => mockShowAlert(...a) }));
const mockCheckZone = jest.fn();
jest.mock("@/services/places.service", () => ({
  getNearbyDrivers: (...a: any[]) => mockGetNearbyDrivers(...a),
  checkZone: (...a: any[]) => mockCheckZone(...a),
}));
jest.mock("@/contexts/authStore", () => ({ useAuthStore: { getState: () => mockAuth } }));

import { ensureDriversOnline, ensureServiceable, requireLogin } from "../orderGate";

describe("ensureServiceable", () => {
  it("passes inside a service zone", async () => {
    mockCheckZone.mockResolvedValue({ inZone: true });
    await expect(ensureServiceable({ lat: 17.01, lng: 81.79 })).resolves.toBe(true);
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it("stops the order with a clear message outside every zone", async () => {
    mockCheckZone.mockResolvedValue({ inZone: false });
    await expect(ensureServiceable({ lat: 37.4, lng: -122.1 })).resolves.toBe(false);
    expect(mockShowAlert).toHaveBeenCalledWith("app.checkout.notServiceableTitle", "app.checkout.notServiceableMessage", undefined, "warning");
  });

  it("does not block when the lookup fails or there is no readable point", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockCheckZone.mockRejectedValue(new Error("network"));
    await expect(ensureServiceable({ lat: 17.01, lng: 81.79 })).resolves.toBe(true);
    await expect(ensureServiceable(null)).resolves.toBe(true);
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth = { user: null, token: null };
});

describe("requireLogin", () => {
  it("lets a signed-in customer through without a prompt", () => {
    mockAuth = { user: { _id: "u1" }, token: "tok" };
    expect(requireLogin()).toBe(true);
    expect(mockShowAlert).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("tells a guest why and sends them to Login", () => {
    expect(requireLogin()).toBe(false);
    expect(mockShowAlert).toHaveBeenCalledWith("app.auth.loginToContinueTitle", "app.auth.loginToContinueMessage");
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});

describe("ensureDriversOnline", () => {
  it("passes when at least one driver is online, asking within 5 km of the point", async () => {
    mockGetNearbyDrivers.mockResolvedValue([{ _id: "d1" }]);
    await expect(ensureDriversOnline({ lat: 17.01, lng: 81.79 })).resolves.toBe(true);
    expect(mockGetNearbyDrivers).toHaveBeenCalledWith("latitude=17.01&longitude=81.79&radius=5000");
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it("stops the order with a clear message when no driver is online", async () => {
    mockGetNearbyDrivers.mockResolvedValue([]);
    await expect(ensureDriversOnline({ lat: 17.01, lng: 81.79 })).resolves.toBe(false);
    expect(mockShowAlert).toHaveBeenCalledWith("app.checkout.noDriversTitle", "app.checkout.noDriversMessage", undefined, "warning");
  });

  it("does not block when the lookup itself fails: the server still decides", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockGetNearbyDrivers.mockRejectedValue(new Error("network"));
    await expect(ensureDriversOnline({ lat: 17.01, lng: 81.79 })).resolves.toBe(true);
    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it("does not block, or call the API, when there is no readable point", async () => {
    await expect(ensureDriversOnline(null)).resolves.toBe(true);
    await expect(ensureDriversOnline({ lat: NaN, lng: 81.79 })).resolves.toBe(true);
    expect(mockGetNearbyDrivers).not.toHaveBeenCalled();
  });
});
