import { useTranslation } from "react-i18next";
import { MapBackButton, mapControlTop } from "@/components/ui/MapBackButton";
import { RefreshButton } from "@/components/ui/RefreshButton";
import type { ThemeTokens } from "@/constants/colors";
import type { FindingDriverStyles } from "@/features/ride/finding-driver.styles";

// Floating back control over the map. It opens the cancel sheet rather than
// popping the stack — leaving this screen means abandoning the search. The
// refresh control sits opposite it and re-checks the order immediately.

interface Props {
  insets: { top: number };
  onPress: () => void;
  styles: FindingDriverStyles;
  tokens: ThemeTokens;
  onRefresh: () => void;
  refreshing: boolean;
}

export function FindingDriverBackButton({ insets, onPress, styles, onRefresh, refreshing }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <MapBackButton absolute onPress={onPress} />
      <RefreshButton
        style={[styles.refreshBtn, { top: mapControlTop(insets as any) }]}
        onPress={onRefresh}
        refreshing={refreshing}
        accessibilityLabel={t("actions.refresh")}
      />
    </>
  );
}
