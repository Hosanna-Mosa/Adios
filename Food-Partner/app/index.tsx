import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useTokens } from "@/contexts/themeStore";
import { createStyles } from "@/features/auth/auth.styles";
import { LaunchScreen } from "@/features/auth/components/LaunchScreen";

// The first route. Shown for the instant between the splash hiding and the
// auth gate in app/_layout.tsx deciding where the partner belongs.
export default function IndexScreen() {
  const { t } = useTranslation();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  return (
    <ScreenShell>
      <LaunchScreen caption={t("brand.partner")} styles={styles} />
    </ScreenShell>
  );
}
