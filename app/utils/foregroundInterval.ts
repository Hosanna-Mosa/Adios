import { AppState } from "react-native";

/**
 * A drop-in for `setInterval` that skips its ticks while the app is in the
 * background. Polling a server for a screen nobody can see wakes the radio and
 * the CPU for nothing, which is most of an app's idle battery cost. The returned
 * id is a normal interval id, so `clearInterval` works on it unchanged.
 *
 * Nothing is replayed for the ticks that were skipped: the next one after the
 * app returns runs as usual, a few seconds at most for the intervals in use here.
 */
export function setForegroundInterval(callback: () => void, ms: number): ReturnType<typeof setInterval> {
  return setInterval(() => {
    if (AppState.currentState !== "active") return;
    callback();
  }, ms);
}
