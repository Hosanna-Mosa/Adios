import { AppState } from "react-native";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

// The new-order ring inside the app — the same sound a push plays when the app
// is closed (assets/sounds/new_order.wav). It plays even with the phone on
// silent: an order the kitchen doesn't hear is an order that goes cold.

let player: AudioPlayer | null = null;
let audioModeSet = false;
let stopTimer: ReturnType<typeof setTimeout> | null = null;

/** A ring never runs longer than this, even while the new-order banner stays up. */
export const MAX_RING_MS = 5000;

function ringPlayer(): AudioPlayer {
  if (!audioModeSet) {
    audioModeSet = true;
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "duckOthers" }).catch(() => {});
  }
  if (!player) player = createAudioPlayer(require("@/assets/sounds/new_order.wav"));
  return player;
}

/**
 * Rings once, or on repeat when `loop` — but never for more than MAX_RING_MS
 * (it used to repeat until the banner was dismissed). Only while the app is on
 * screen — in the background the push's own sound does the job, and two rings
 * at once would just be noise.
 */
export function startOrderRing({ loop }: { loop: boolean }) {
  if (AppState.currentState !== "active") return;
  try {
    const ring = ringPlayer();
    ring.loop = loop;
    ring.seekTo(0).catch(() => {});
    ring.play();
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(stopOrderRing, MAX_RING_MS);
  } catch {
    // Missing audio must never crash the alert — the banner and vibration still show.
  }
}

export function stopOrderRing() {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
  try {
    player?.pause();
  } catch {
    // Nothing to stop.
  }
}
