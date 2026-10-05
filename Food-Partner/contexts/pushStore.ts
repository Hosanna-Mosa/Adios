import { create } from "zustand";

// Whether this device gets order alerts while the app is closed, and the push
// token it registered with the backend — sign-out unregisters that token so a
// signed-out phone stops ringing for the outlet.

/**
 * granted     — alerts reach this device;
 * denied      — the partner refused notifications (the dashboard asks them to turn them on);
 * unavailable — the device can't get a push token (simulator, missing EAS project id);
 * unknown     — not checked yet.
 */
export type PushPermission = "unknown" | "granted" | "denied" | "unavailable";

interface PushState {
  permission: PushPermission;
  registeredToken: string | null;
  setPermission: (permission: PushPermission) => void;
  setRegisteredToken: (token: string | null) => void;
}

export const usePushStore = create<PushState>((set) => ({
  permission: "unknown",
  registeredToken: null,
  setPermission: (permission) => set({ permission }),
  setRegisteredToken: (registeredToken) => set({ registeredToken }),
}));
