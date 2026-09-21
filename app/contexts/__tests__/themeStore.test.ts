import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeStore } from "../themeStore";

beforeEach(async () => {
  await AsyncStorage.clear();
  useThemeStore.setState({ theme: "light" });
});

describe("themeStore", () => {
  it("starts light", () => {
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("toggles between light and dark", () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("dark");

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("persists the chosen theme", async () => {
    useThemeStore.getState().setTheme("dark");
    // persist() is fire-and-forget, so let its microtask land
    await Promise.resolve();

    expect(await AsyncStorage.getItem("app_theme")).toBe("dark");
  });

  it("hydrates a saved theme on boot", async () => {
    await AsyncStorage.setItem("app_theme", "dark");

    await useThemeStore.getState().hydrateTheme();

    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("keeps the light default when storage holds something unexpected", async () => {
    await AsyncStorage.setItem("app_theme", "solarized");

    await useThemeStore.getState().hydrateTheme();

    expect(useThemeStore.getState().theme).toBe("light");
  });
});
