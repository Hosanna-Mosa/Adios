/* eslint-env jest */
// AsyncStorage has no native module under Jest, so every store that persists
// needs this mock in place before it is imported.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// expo-secure-store has no native module under Jest either: an in-memory
// Keychain/Keystore stand-in, reset by tests through __reset().
jest.mock("expo-secure-store", () => {
  let store = {};
  return {
    __reset: () => {
      store = {};
    },
    setItemAsync: jest.fn(async (key, value) => {
      store[key] = value;
    }),
    getItemAsync: jest.fn(async (key) => (key in store ? store[key] : null)),
    deleteItemAsync: jest.fn(async (key) => {
      delete store[key];
    }),
  };
});
