import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { type EdgeInsets } from "react-native-safe-area-context";

// Moved out of app/all-services.tsx. Now built from the shared Header
// (components/ui/Header) instead of a duplicated local copy, so the back
// chevron, hit target and accessibility label match every other screen.

interface Props {
  insets: EdgeInsets;
}

export function AllServicesHeaderRow({
  insets,
}: Props) {
  const { t } = useTranslation();
  return (
    <Header
      title={t("app.home.allServices")}
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
      style={{ paddingTop: insets.top + 4 }}
    />
  );
}
