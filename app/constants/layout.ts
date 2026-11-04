import { Platform } from "react-native";

/**
 * Extra top space on web, where the browser has no safe-area inset for the
 * status bar but the app's fixed chrome still needs clearance. Was the literal
 * `Platform.OS === "web" ? 67 : 0`, repeated in each screen header.
 */
export const WEB_TOP_OFFSET = Platform.OS === "web" ? 67 : 0;
