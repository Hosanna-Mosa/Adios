// Business-logic tests only: stores, utils, services and hooks.
// Screens and components are covered by the emulator screenshot diffing
// instead — RN component tests are brittle and would duplicate that.
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["<rootDir>/**/__tests__/**/*.test.ts?(x)"],
  collectCoverageFrom: [
    "store/**/*.ts",
    "services/**/*.ts",
    "utils/**/*.ts",
    "features/**/use*.ts",
    "hooks/**/*.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|zustand)",
  ],
};
