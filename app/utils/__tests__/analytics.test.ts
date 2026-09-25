import { AppState } from "react-native";

// The backend queue in utils/analytics: what reaches POST /analytics/events,
// and when. Firebase is out of scope — under Jest Platform.OS is "ios", where
// the Firebase half is a no-op by design.

type Analytics = typeof import("../analytics");

let appStateHandler: ((state: string) => void) | undefined;
let fetchMock: jest.Mock;

/** A fresh module per test: the queue and session id are module state. */
function load(): Analytics {
  let mod!: Analytics;
  jest.isolateModules(() => {
    mod = require("../analytics");
  });
  return mod;
}

const sentBatches = () => fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).events);

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock = jest.fn().mockResolvedValue({ status: 202 });
  global.fetch = fetchMock as any;
  appStateHandler = undefined;
  jest.spyOn(AppState, "addEventListener").mockImplementation((_type: any, handler: any) => {
    appStateHandler = handler;
    return { remove: jest.fn() } as any;
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("analytics backend queue", () => {
  it("batches events and sends them after 10 seconds, with the token", async () => {
    const a = load();
    a.configureAnalytics({ apiUrl: "https://api.test/api/v1/", app: "customer", getToken: () => "tok" });

    a.trackScreen("(tabs)");
    a.trackEvent("order_placed", { service_type: "bike", value: 120, coupon: undefined });
    expect(fetchMock).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(10_000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/api/v1/analytics/events");
    expect(init.headers.Authorization).toBe("Bearer tok");

    const [screen, order] = sentBatches()[0];
    expect(screen).toMatchObject({ name: "screen_view", app: "customer", props: { screen: "(tabs)" } });
    expect(order.name).toBe("order_placed");
    // undefined values are dropped, not sent as null
    expect(order.props).toEqual({ service_type: "bike", value: 120 });
    // one session id for the whole app run
    expect(screen.sessionId).toBe(order.sessionId);
  });

  it("sends immediately once 20 events are queued", async () => {
    const a = load();
    a.configureAnalytics({ apiUrl: "https://api.test/api/v1", app: "driver", getToken: () => null });

    for (let i = 0; i < 20; i++) a.trackEvent("go_online");
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sentBatches()[0]).toHaveLength(20);
    // signed out: no Authorization header at all
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("holds events tracked before configureAnalytics and sends them after", async () => {
    const a = load();
    a.trackScreen("index");
    await jest.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).not.toHaveBeenCalled();

    a.configureAnalytics({ apiUrl: "https://api.test/api/v1", app: "customer", getToken: () => null });
    await jest.advanceTimersByTimeAsync(10_000);

    expect(sentBatches()[0][0]).toMatchObject({ name: "screen_view", app: "customer" });
  });

  it("keeps events when offline and retries them on the next flush", async () => {
    const a = load();
    a.configureAnalytics({ apiUrl: "https://api.test/api/v1", app: "customer", getToken: () => null });
    fetchMock.mockRejectedValueOnce(new TypeError("Network request failed"));

    a.trackEvent("login", { method: "otp" });
    await jest.advanceTimersByTimeAsync(10_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    a.trackEvent("order_placed");
    await jest.advanceTimersByTimeAsync(10_000);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sentBatches()[1].map((e: any) => e.name)).toEqual(["login", "order_placed"]);
  });

  it("does not resend a batch the server answered with an error", async () => {
    const a = load();
    a.configureAnalytics({ apiUrl: "https://api.test/api/v1", app: "customer", getToken: () => null });
    fetchMock.mockResolvedValueOnce({ status: 429 });

    a.trackEvent("login");
    await jest.advanceTimersByTimeAsync(10_000);
    a.trackEvent("sign_up");
    await jest.advanceTimersByTimeAsync(10_000);

    expect(sentBatches()[1].map((e: any) => e.name)).toEqual(["sign_up"]);
  });

  it("flushes straight away when the app goes to the background", async () => {
    const a = load();
    a.configureAnalytics({ apiUrl: "https://api.test/api/v1", app: "customer", getToken: () => null });

    a.trackEvent("purchase", { value: 250 });
    appStateHandler?.("background");
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sentBatches()[0][0].name).toBe("purchase");
  });

  it("splits a large backlog into requests of at most 50 events", async () => {
    const a = load();
    // Queued before configuration, so nothing can be sent yet.
    for (let i = 0; i < 90; i++) a.trackEvent("screen_view");

    a.configureAnalytics({ apiUrl: "https://api.test/api/v1", app: "customer", getToken: () => null });
    await jest.advanceTimersByTimeAsync(0);

    expect(sentBatches().map((b: any[]) => b.length)).toEqual([50, 40]);
  });

  it("caps the backlog at 100 events, dropping the oldest", async () => {
    const a = load();
    for (let i = 0; i < 120; i++) a.trackEvent("screen_view", { i });

    a.configureAnalytics({ apiUrl: "https://api.test/api/v1", app: "customer", getToken: () => null });
    await jest.advanceTimersByTimeAsync(0);

    const sent = sentBatches().flat();
    expect(sent).toHaveLength(100);
    expect(sent[0].props.i).toBe(20);
  });
});
