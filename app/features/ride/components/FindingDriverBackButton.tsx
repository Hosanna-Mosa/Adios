import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
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

export function FindingDriverBackButton({ insets, onPress, styles, tokens, onRefresh, refreshing }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={onPress}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <RefreshButton
        style={[styles.refreshBtn, { top: insets.top + 10 }]}
        onPress={onRefresh}
        refreshing={refreshing}
        accessibilityLabel={t("actions.refresh")}
      />
    </>
  );
}
