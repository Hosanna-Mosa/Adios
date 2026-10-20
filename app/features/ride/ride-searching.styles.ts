import { type ThemeTokens } from "@/constants/colors";

// Styles for app/ride-searching.tsx. Migrated from the legacy `Colors`
// palette to `designTokens` (BUG-098) — see each part file for the exact
// color-name mapping. Lives here rather than beside the screen because app/
// is Expo Router's routing directory and a non-route file in there is
// treated as a route.
import { createRootStyles } from "./ride-searching.styles.root";
import { createFloatingCardStyles } from "./ride-searching.styles.floating-card";
import { createTripButtonTextStyles } from "./ride-searching.styles.trip-button-text";
import { createServiceSummaryCardStyles } from "./ride-searching.styles.service-summary-card";
import { createTotalFareRowStyles } from "./ride-searching.styles.total-fare-row";
import { createCancelSheetHandleStyles } from "./ride-searching.styles.cancel-sheet-handle";
import { createCurrentAddressLabelStyles } from "./ride-searching.styles.current-address-label";

// Composed from the parts above so no consumer has to change: the keys and
// their values are exactly what this file declared before it was split.

export const createStyles = (tokens: ThemeTokens, insets: any) => ({
  ...createRootStyles(tokens, insets),
  ...createFloatingCardStyles(tokens, insets),
  ...createTripButtonTextStyles(tokens, insets),
  ...createServiceSummaryCardStyles(tokens, insets),
  ...createTotalFareRowStyles(tokens, insets),
  ...createCancelSheetHandleStyles(tokens, insets),
  ...createCurrentAddressLabelStyles(tokens, insets),
});

/** Exact shape of this screen's stylesheet, for components that take it as a prop. */
export type RideSearchingStyles = ReturnType<typeof createStyles>;
