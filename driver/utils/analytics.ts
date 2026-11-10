import { AppState, Platform, TurboModuleRegistry } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

// Every event goes two places:
//
//   Firebase Analytics — Android and iOS (not web). Long-term reports,
//     retention, funnels. Its SDK uploads in batches of up to an hour.
//   Our backend (POST /analytics/events) — queued here and sent every 10 s,
//     so the admin Live Activity page shows what is happening right now.
//
// Nothing here ever throws: a failed analytics call must never break the flow
// that made it.

type Params = Record<string, string | number | boolean | undefined>;
type CleanParams = Record<string, string | number | boolean>;

// ---------------------------------------------------------------------------
// Firebase (Android and iOS, loaded lazily)
// ---------------------------------------------------------------------------

let analyticsModule: any = null;
let analyticsInstance: any = null;
// Expo Go can't contain Firebase's native code, so Firebase is simply off there.
// Every EAS / `expo run:android` build has it, and Firebase turns on by itself.
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let firebaseUnavailable = IS_EXPO_GO;

function getFirebase() {
  if (Platform.OS === "web" || firebaseUnavailable) return null;
  if (!analyticsInstance) {
    // A dev build made before Firebase was added also lacks the native module.
    // Check first: Metro reports a throwing lazy require() as a fatal error
    // even inside try/catch.
    if (!TurboModuleRegistry.get("NativeRNFBTurboApp")) {
      firebaseUnavailable = true;
      console.warn("[Analytics] Firebase native module not in this build; skipping.");
      return null;
    }
    try {
      // Required lazily so the web bundle never touches the missing native module.
      analyticsModule = require("@react-native-firebase/analytics");
      analyticsInstance = analyticsModule.getAnalytics();
    } catch (err) {
      console.warn("[Analytics] Firebase unavailable:", err);
      firebaseUnavailable = true;
      return null;
    }
  }
  return analyticsInstance;
}

/** Firebase and our backend both reject undefined values, so they are dropped. */
function clean(params?: Params): CleanParams | undefined {
  if (!params) return undefined;
  const out: CleanParams = {};
  for (const [k, v] of Object.entries(params)) if (v !== undefined) out[k] = v;
  return out;
}

// ---------------------------------------------------------------------------
// Batching to our own backend
// ---------------------------------------------------------------------------

type QueuedEvent = {
  name: string;
  sessionId: string;
  platform: string;
  appVersion: string;
  props?: CleanParams;
  at: number;
};

const FLUSH_AFTER_MS = 10_000;
const FLUSH_AT_COUNT = 20;
const MAX_QUEUE = 100;
const MAX_BATCH = 50; // the backend's per-request limit

/** One app run. Regenerated on launch, never persisted, so it groups a session
 *  without becoming a durable device identifier. */
const SESSION_ID = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
const APP_VERSION = Constants.expoConfig?.version ?? "unknown";

let config: { apiUrl: string; app: string; getToken: () => string | null | undefined } | null = null;
const queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;

/**
 * Called once from app/_layout.tsx. Passing the token getter in (rather than
 * importing the auth store here) keeps this module free of the store ↔
 * credentials ↔ analytics import cycle. Events tracked before this is called
 * wait in the queue.
 */
export function configureAnalytics(options: { apiUrl: string; app: string; getToken: () => string | null | undefined }) {
  config = { ...options, apiUrl: options.apiUrl.replace(/\/+$/, "") };
  scheduleFlush();
}

async function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!config || flushing || queue.length === 0) return;
  flushing = true;

  try {
    while (queue.length > 0) {
      const batch = queue.splice(0, MAX_BATCH);
      const token = config.getToken();
      // The app name is attached here, not when queued, so events tracked
      // before configureAnalytics ran are still labelled correctly.
      const app = config.app;
      try {
        await fetch(`${config.apiUrl}/analytics/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ events: batch.map((e) => ({ ...e, app })) }),
        });
        // Any HTTP answer (even 4xx/429) means the server has seen the batch;
        // only a network failure is worth keeping the events for.
      } catch {
        // Offline: put them back for the next flush, dropping the oldest
        // rather than holding memory without limit.
        queue.unshift(...batch);
        if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
        break;
      }
    }
  } finally {
    flushing = false;
  }
}

function scheduleFlush() {
  if (queue.length >= FLUSH_AT_COUNT) {
    void flush();
    return;
  }
  if (!flushTimer && queue.length > 0) flushTimer = setTimeout(() => void flush(), FLUSH_AFTER_MS);
}

function enqueue(name: string, props?: CleanParams) {
  queue.push({
    name,
    sessionId: SESSION_ID,
    platform: Platform.OS,
    appVersion: APP_VERSION,
    props,
    at: Date.now(),
  });
  if (queue.length > MAX_QUEUE) queue.shift();
  scheduleFlush();
}

// Send whatever is queued as the app leaves the foreground — the process may
// be killed while backgrounded, and those would be the session's last events.
AppState.addEventListener("change", (state) => {
  if (state !== "active") void flush();
});

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

/**
 * Firebase only builds its item reports (most viewed / added / purchased
 * items) from an `items` array, so an event that names a single item also
 * carries it in that form. Our backend keeps the flat params.
 */
function withFirebaseItems(props?: CleanParams): Record<string, unknown> | undefined {
  if (!props || props.item_id === undefined) return props;
  const item: Record<string, string | number> = { item_id: String(props.item_id) };
  if (props.item_name !== undefined) item.item_name = String(props.item_name);
  if (props.item_category !== undefined) item.item_category = String(props.item_category);
  if (props.vendor_name !== undefined) item.item_brand = String(props.vendor_name);
  if (typeof props.price === "number") item.price = props.price;
  if (typeof props.quantity === "number") item.quantity = props.quantity;
  return { ...props, items: [item] };
}

export function trackEvent(name: string, params?: Params) {
  try {
    const props = clean(params);
    const analytics = getFirebase();
    if (analytics) Promise.resolve(analyticsModule.logEvent(analytics, name, withFirebaseItems(props))).catch(() => {});
    enqueue(name, props);
  } catch {
    // Analytics must never surface an error to the caller.
  }
}

/** The route last reported by trackScreen, so a tap can say where it happened. */
let currentScreen = "index";

export function trackScreen(screenName: string) {
  currentScreen = screenName;
  try {
    const analytics = getFirebase();
    if (analytics) {
      analyticsModule
        .logScreenView(analytics, { screen_name: screenName, screen_class: screenName })
        .catch(() => {});
    }
    enqueue("screen_view", { screen: screenName });
  } catch {
    /* ignore */
  }
}

/**
 * A button press. `button` is the visible label (see components/ui/
 * TrackedTouchable), so numbers are masked and the text is capped: a label
 * like "Book Bike · ₹69" becomes "Book Bike · ₹#" and groups across fares.
 */
export function trackTap(button: string, params?: Params) {
  const label = button.replace(/\s+/g, " ").trim();
  const safe = label.includes("@") ? "(hidden)" : label.replace(/\d+([.,]\d+)*/g, "#").slice(0, 60);
  trackEvent("button_tap", { button: safe || "(unlabelled)", screen: currentScreen, ...params });
}

export function setAnalyticsUserId(userId: string | null) {
  // Our backend identifies the user from the request's token; only Firebase needs this.
  try {
    const analytics = getFirebase();
    if (!analytics) return;
    analyticsModule.setUserId(analytics, userId).catch(() => {});
  } catch {
    /* ignore */
  }
}
