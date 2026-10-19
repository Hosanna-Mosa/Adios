import { MapBackButton } from "@/components/ui/MapBackButton";
import type { ThemeTokens } from "@/constants/colors";
import type { FindingDriverStyles } from "@/features/ride/finding-driver.styles";

// Floating back control over the map. It opens the cancel sheet rather than
// popping the stack — leaving this screen means abandoning the search.

interface Props {
  insets: { top: number };
  onPress: () => void;
  styles: FindingDriverStyles;
  tokens: ThemeTokens;
}

export function FindingDriverBackButton({ onPress }: Props) {
  return <MapBackButton absolute onPress={onPress} />;
}
