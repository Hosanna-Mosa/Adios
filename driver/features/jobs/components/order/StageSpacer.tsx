import React from "react";

import { Box } from "@/components/ui/Box";

/** Takes the free height of a stage, so the details sit together at the top and
 * the action button at the bottom (the stage container spreads its children). */
export function StageSpacer() {
  return <Box style={{ flex: 1 }} />;
}
