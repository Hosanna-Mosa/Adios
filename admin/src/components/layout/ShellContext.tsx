import { createContext, useContext } from "react";

/**
 * Present when a page renders inside a persistent shell (DashboardShell /
 * VendorShell). The shell owns the sidebar and top bar so they survive
 * navigation; a page's own DashboardLayout / VendorLayout then only reports its
 * search placeholder up and renders its content.
 */
export interface ShellContextValue {
  setSearchPlaceholder: (placeholder?: string) => void;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

export const useShell = () => useContext(ShellContext);
