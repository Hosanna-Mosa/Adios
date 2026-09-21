import React from "react";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { styles } from "../earnings.styles";

/** Placeholder card while the earnings summary loads. */
export function EarningsLoadingCard() {
  return <SkeletonCard style={styles.loadingCard} />;
}
