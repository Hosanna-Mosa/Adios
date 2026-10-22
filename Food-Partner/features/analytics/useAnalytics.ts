import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTokens } from "@/contexts/themeStore";
import { useSalesAnalytics } from "@/queries/insights.queries";
import type { AnalyticsRange } from "@/types/insights";
import { createAnalyticsStyles } from "./analytics.styles";

export const ANALYTICS_RANGES: AnalyticsRange[] = [7, 30, 90];

/** Sales analytics: revenue, orders, top dishes and cancellations over the chosen period. */
export function useAnalytics() {
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createAnalyticsStyles(tokens), [tokens]);
  const [range, setRange] = useState<AnalyticsRange>(7);
  const query = useSalesAnalytics(range);

  return {
    insets,
    tokens,
    styles,
    range,
    setRange,
    data: query.data,
    loading: query.isLoading,
    error: query.isError && !query.data,
    refreshing: query.isRefetching && !query.isLoading,
    refetch: query.refetch,
  };
}
