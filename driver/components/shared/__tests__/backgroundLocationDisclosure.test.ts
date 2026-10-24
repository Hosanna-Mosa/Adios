import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@/i18n", () => ({ __esModule: true, default: { t: (k: string) => k } }));

import { confirmBackgroundLocationDisclosure } from "../backgroundLocationDisclosure";

type Button = { text: string; onPress?: () => void };
const pressButton = (index: number) =>
  jest.spyOn(Alert, "alert").mockImplementation((_title, _message, buttons) => {
    (buttons as Button[])[index].onPress?.();
  });

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

it("shows what is collected, why, and that it runs while the app is closed", async () => {
  const alert = pressButton(1);
  await confirmBackgroundLocationDisclosure();
  expect(alert).toHaveBeenCalledWith(
    "jobs.backgroundLocationDisclosureTitle",
    "jobs.backgroundLocationDisclosureBody",
    expect.any(Array),
    expect.objectContaining({ cancelable: true }),
  );
});

it("accepting resolves true and is remembered, so it is not shown again", async () => {
  const alert = pressButton(1);
  expect(await confirmBackgroundLocationDisclosure()).toBe(true);
  expect(await confirmBackgroundLocationDisclosure()).toBe(true);
  expect(alert).toHaveBeenCalledTimes(1);
});

it("declining resolves false and asks again next time", async () => {
  const alert = pressButton(0);
  expect(await confirmBackgroundLocationDisclosure()).toBe(false);
  expect(await confirmBackgroundLocationDisclosure()).toBe(false);
  expect(alert).toHaveBeenCalledTimes(2);
});
