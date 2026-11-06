// Business-logic tests: order mapping, the order-lifecycle store, pickup / delivery
// code checks and background location. Mirrors the customer app's setup (app/jest.config.js).
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
