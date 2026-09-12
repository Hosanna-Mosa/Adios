// The module reads EXPO_PUBLIC_WEB_URL at import time, so the env var is set
// before requiring it. Share is taken from the SAME module registry as the
// subject — after resetModules they would otherwise be two different objects
// and the spy would never see the call.
const WEB = "https://flavour.example";

const load = (webUrl: string) => {
  jest.resetModules();
  process.env.EXPO_PUBLIC_WEB_URL = webUrl;
  const { Share } = require("react-native");
  const { shareRestaurant } = require("../shareLink");
  const spy = jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" });
  return { shareRestaurant, spy };
};

describe("shareRestaurant", () => {
  it("shares an outlet link", async () => {
    const { shareRestaurant, spy } = load(WEB);

    await shareRestaurant("v1", "Paradise");

    expect(spy).toHaveBeenCalledWith({
      message: `Check out Paradise on Flavour! ${WEB}/restaurant-menu/v1`,
      url: `${WEB}/restaurant-menu/v1`,
    });
  });

  it("deep-links to one dish when an item is given", async () => {
    const { shareRestaurant, spy } = load(WEB);

    await shareRestaurant("v1", "Paradise", "i9", "Biryani");

    expect(spy).toHaveBeenCalledWith({
      message: `Check out Biryani at Paradise on Flavour! ${WEB}/restaurant-menu/v1?item=i9`,
      url: `${WEB}/restaurant-menu/v1?item=i9`,
    });
  });

  it("names the dish generically when only an id is known", async () => {
    const { shareRestaurant, spy } = load(WEB);

    await shareRestaurant("v1", "Paradise", "i9");

    const [{ message }] = spy.mock.calls[0] as [{ message: string }];
    expect(message).toContain("Check out this dish at Paradise");
  });

  it("does not share at all when no web URL is configured", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { shareRestaurant, spy } = load("");

    await shareRestaurant("v1", "Paradise");

    expect(spy).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("swallows a Share failure rather than crashing the screen", async () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    const { shareRestaurant, spy } = load(WEB);
    spy.mockRejectedValue(new Error("user cancelled"));

    await expect(shareRestaurant("v1", "Paradise")).resolves.toBeUndefined();
    error.mockRestore();
  });
});
