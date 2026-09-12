import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";

// Styles for app/ride-searching.tsx. Moved out of the screen unchanged --
// every value is exactly as it was, so nothing renders differently. Lives
// here rather than beside the screen because app/ is Expo Router's routing
// directory and a non-route file in there is treated as a route.
import { createRootStyles } from "./ride-searching.styles.root";
import { createFloatingCardStyles } from "./ride-searching.styles.floating-card";
import { createTripButtonTextStyles } from "./ride-searching.styles.trip-button-text";
import { createServiceSummaryCardStyles } from "./ride-searching.styles.service-summary-card";
import { createTotalFareRowStyles } from "./ride-searching.styles.total-fare-row";
import { createCancelSheetHandleStyles } from "./ride-searching.styles.cancel-sheet-handle";
import { createCurrentAddressLabelStyles } from "./ride-searching.styles.current-address-label";

// Composed from the parts above so no consumer has to change: the keys and
// their values are exactly what this file declared before it was split.

export const createStyles = (colors: typeof Colors.light, insets: any) => ({
  ...createRootStyles(colors, insets),
  ...createFloatingCardStyles(colors, insets),
  ...createTripButtonTextStyles(colors, insets),
  ...createServiceSummaryCardStyles(colors, insets),
  ...createTotalFareRowStyles(colors, insets),
  ...createCancelSheetHandleStyles(colors, insets),
  ...createCurrentAddressLabelStyles(colors, insets),
});

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type RideSearchingStyles = ReturnType<typeof createStyles>;
