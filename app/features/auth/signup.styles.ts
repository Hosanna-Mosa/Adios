import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";

// Styles for app/signup.tsx. Moved out of the screen unchanged -- every value
// is exactly as it was, so nothing renders differently. Lives here rather
// than beside the screen because app/ is Expo Router's routing directory
// and a non-route file in there is treated as a route.
import { createRootStyles } from "./signup.styles.root";
import { createStrengthLabelStyles } from "./signup.styles.strength-label";

// Composed from the parts above so no consumer has to change: the keys and
// their values are exactly what this file declared before it was split.

export const createStyles = (tokens: ThemeTokens, accent: ServiceTokens) => ({
  ...createRootStyles(tokens, accent),
  ...createStrengthLabelStyles(tokens, accent),
});

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type SignupStyles = ReturnType<typeof createStyles>;
