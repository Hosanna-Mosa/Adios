import React from "react";
import { Box } from "@/components/ui/Box";

/** Evenly spaced stack of fields inside one onboarding step. */
export function FieldColumn({
  gap = 16,
  children,
}: {
  gap?: number;
  children: React.ReactNode;
}) {
  return <Box style={{ gap }}>{children}</Box>;
}
