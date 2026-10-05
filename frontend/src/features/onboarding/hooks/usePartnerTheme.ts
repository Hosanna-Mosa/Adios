import { useEffect } from "react";

/**
 * Switches the page to the partner orange (see `.partner-theme` in
 * styles.css) while a partner onboarding page is mounted. Applied to <html>
 * rather than a wrapper so dialogs portalled to <body> are themed as well.
 */
export function usePartnerTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("partner-theme");
    return () => root.classList.remove("partner-theme");
  }, []);
}
