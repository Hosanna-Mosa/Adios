import { Dimensions, StyleSheet } from "react-native";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";

// Styles for app/pickup-confirmation.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.

const { height } = Dimensions.get("window");
import { createMapAreaStyles } from "./pickup-confirmation.styles.map-area";
import { createTitleStyles } from "./pickup-confirmation.styles.title";

// Composed from the parts above so no consumer has to change: the keys and
// their values are exactly what this file declared before it was split.

export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens, insets: any) => ({
  ...createMapAreaStyles(tokens, accent, insets),
  ...createTitleStyles(tokens, accent, insets),
});

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type PickupConfirmationStyles = ReturnType<typeof createStyles>;
