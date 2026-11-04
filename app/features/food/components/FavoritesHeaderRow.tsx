import { useTranslation } from "react-i18next";
import { fadeInDown } from "@/motion/presets";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { type EdgeInsets } from "react-native-safe-area-context";

// Moved out of app/favorites.tsx. Rebuilt on the shared Header — its
// headerRow/backBtn/headerTitle styles were a byte-for-byte duplicate of
// Header's own row/backBtn/title (same 40pt chip, same body.semibold large
// title, same row spacing), so this changes nothing on screen except the
// chevron icon going from 22pt to Header's fixed 20pt.

interface Props {
  insets: EdgeInsets;
}

export function FavoritesHeaderRow({ insets }: Props) {
  const { t } = useTranslation();
  return (
    <Header
      title="Favorites"
      onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/profile"))}
      accessibilityLabel={t("app.support.back")}
      entering={fadeInDown(0)}
      style={{ paddingTop: insets.top + 4 }}
    />
  );
}
