/* global jest */
// AsyncStorage has no native module under Jest; anything that persists needs this mock.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
