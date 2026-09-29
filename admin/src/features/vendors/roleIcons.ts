import { Headphones, ShieldCheck, Store } from "lucide-react";
import type { PanelRole } from "@/lib/session";

/** The icon for each "Sign in as" option, also used as the login page's header icon. */
export const ROLE_ICONS: Record<PanelRole, typeof Store> = {
  vendor: Store,
  admin: ShieldCheck,
  support: Headphones,
};
