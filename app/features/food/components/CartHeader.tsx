import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { type EdgeInsets } from "react-native-safe-area-context";

// Moved out of app/cart.tsx. Rebuilt on the shared Header — its iconBtn/
// headerTitleSolo styles were a byte-for-byte duplicate of Header's own
// backBtn/title (same 40pt chip, same body.semibold large title), so this
// changes nothing on screen.

interface Props {
  insets: EdgeInsets;
}

export function CartHeader({ insets }: Props) {
  const { t } = useTranslation();
  return (
    <Header
      title={t("tabs.cart")}
      onBack={() => router.back()}
      accessibilityLabel={t("app.support.back")}
      style={{ paddingTop: insets.top + 6, paddingBottom: 12 }}
    />
  );
}
