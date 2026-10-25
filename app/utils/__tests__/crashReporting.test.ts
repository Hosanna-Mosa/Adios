import { reportError } from "../crashReporting";
import { flushAnalytics, trackEvent } from "../analytics";

jest.mock("../analytics", () => ({ trackEvent: jest.fn(), flushAnalytics: jest.fn() }));

describe("reportError", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends an app_error event with the kind, message and first stack frames", () => {
    const error = new Error("boom one");
    reportError("render", error);
    expect(trackEvent).toHaveBeenCalledWith(
      "app_error",
      expect.objectContaining({ kind: "render", fatal: false, message: "boom one" }),
    );
    const props = (trackEvent as jest.Mock).mock.calls[0][1];
    expect(props.stack.length).toBeLessThanOrEqual(200);
  });

  it("reports the same error once, not on every repeat", () => {
    reportError("js", new Error("boom two"));
    reportError("js", new Error("boom two"));
    expect(trackEvent).toHaveBeenCalledTimes(1);
  });

  it("uploads right away for a fatal error", () => {
    reportError("js", new Error("boom three"), true);
    expect(flushAnalytics).toHaveBeenCalled();
  });

  it("accepts a non-Error value and never throws", () => {
    expect(() => reportError("js", "just a string")).not.toThrow();
    expect(trackEvent).toHaveBeenCalledWith("app_error", expect.objectContaining({ message: "just a string" }));
  });
});
