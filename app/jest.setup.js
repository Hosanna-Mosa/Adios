/* eslint-env jest */
// AsyncStorage has no native module under Jest, so every store that persists
// needs this mock in place before it is imported.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
