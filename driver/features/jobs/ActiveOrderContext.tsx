import React, { createContext, useContext } from "react";

import type { ActiveOrderController } from "./hooks/useActiveOrder";

const ActiveOrderContext = createContext<ActiveOrderController | null>(null);

export function ActiveOrderProvider({
  value,
  children,
}: {
  value: ActiveOrderController;
  children: React.ReactNode;
}) {
  return <ActiveOrderContext.Provider value={value}>{children}</ActiveOrderContext.Provider>;
}

export function useActiveOrderCtx(): ActiveOrderController {
  const ctx = useContext(ActiveOrderContext);
  if (!ctx) throw new Error("useActiveOrderCtx must be used inside <ActiveOrderProvider>");
  return ctx;
}
