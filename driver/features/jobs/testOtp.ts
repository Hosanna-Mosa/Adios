/**
 * Test builds show the OTP the driver is being asked for, so a flow can be walked through alone.
 * On only in development, or when a build sets EXPO_PUBLIC_SHOW_TEST_OTP=true. A production build
 * never shows it: the code is the customer's / outlet's to give, and showing it defeats the check.
 */
export const SHOW_TEST_OTP = __DEV__ || process.env.EXPO_PUBLIC_SHOW_TEST_OTP === "true";
