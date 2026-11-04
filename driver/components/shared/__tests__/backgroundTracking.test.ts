jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));
jest.mock("../backgroundLocationTask", () => ({ BACKGROUND_LOCATION_TASK: "bg-location" }));

const mockLocation = {
  getBackgroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
};
const mockIsTaskRegistered = jest.fn();
// Delegates at call time: the module is imported (hoisted) before mockLocation is assigned.
jest.mock("expo-location", () => ({
  getBackgroundPermissionsAsync: (...a: any[]) => mockLocation.getBackgroundPermissionsAsync(...a),
  requestBackgroundPermissionsAsync: (...a: any[]) => mockLocation.requestBackgroundPermissionsAsync(...a),
  startLocationUpdatesAsync: (...a: any[]) => mockLocation.startLocationUpdatesAsync(...a),
  stopLocationUpdatesAsync: (...a: any[]) => mockLocation.stopLocationUpdatesAsync(...a),
  Accuracy: { Balanced: 3 },
}));
jest.mock("expo-task-manager", () => ({ isTaskRegisteredAsync: (...a: any[]) => mockIsTaskRegistered(...a) }));

import { syncBackgroundTracking } from "../backgroundTracking";

// Background location follows the driver's online switch: on while online (with the
// permission), off when they go offline.

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

it("going offline stops the running task", async () => {
  mockIsTaskRegistered.mockResolvedValue(true);
  await syncBackgroundTracking(false);
  expect(mockLocation.stopLocationUpdatesAsync).toHaveBeenCalledWith("bg-location");
  expect(mockLocation.startLocationUpdatesAsync).not.toHaveBeenCalled();
});

it("going offline with nothing running does nothing", async () => {
  mockIsTaskRegistered.mockResolvedValue(false);
  await syncBackgroundTracking(false);
  expect(mockLocation.stopLocationUpdatesAsync).not.toHaveBeenCalled();
});

it("going online with permission starts tracking every 10 s / 10 m", async () => {
  mockIsTaskRegistered.mockResolvedValue(false);
  mockLocation.getBackgroundPermissionsAsync.mockResolvedValue({ status: "granted" });
  await syncBackgroundTracking(true);
  expect(mockLocation.requestBackgroundPermissionsAsync).not.toHaveBeenCalled();
  expect(mockLocation.startLocationUpdatesAsync).toHaveBeenCalledWith(
    "bg-location",
    expect.objectContaining({ timeInterval: 10000, distanceInterval: 10 }),
  );
});

it("asks for permission when it isn't granted yet, and stays off if refused", async () => {
  mockIsTaskRegistered.mockResolvedValue(false);
  mockLocation.getBackgroundPermissionsAsync.mockResolvedValue({ status: "undetermined" });
  mockLocation.requestBackgroundPermissionsAsync.mockResolvedValue({ status: "denied" });
  await syncBackgroundTracking(true);
  expect(mockLocation.requestBackgroundPermissionsAsync).toHaveBeenCalled();
  expect(mockLocation.startLocationUpdatesAsync).not.toHaveBeenCalled();
});

it("doesn't start a second task when one is already running", async () => {
  mockIsTaskRegistered.mockResolvedValue(true);
  mockLocation.getBackgroundPermissionsAsync.mockResolvedValue({ status: "granted" });
  await syncBackgroundTracking(true);
  expect(mockLocation.startLocationUpdatesAsync).not.toHaveBeenCalled();
});

it("a native error is swallowed, not thrown at the online switch", async () => {
  mockIsTaskRegistered.mockRejectedValue(new Error("TaskManager unavailable"));
  await expect(syncBackgroundTracking(true)).resolves.toBeUndefined();
});
