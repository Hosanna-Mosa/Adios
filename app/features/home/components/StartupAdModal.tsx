import { Modal } from "react-native";
import { HomeStartupAdOverlay } from "./HomeStartupAdOverlay";
import { type ThemeTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeStartupAd: any;
  hasShownStartupAd: boolean;
  setActiveStartupAd: any;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function StartupAdModal({
  activeStartupAd,
  hasShownStartupAd,
  setActiveStartupAd,
  styles,
  tokens,
}: Props) {
  return (
    <Modal visible={hasShownStartupAd && !!activeStartupAd} transparent animationType="fade">
      <HomeStartupAdOverlay
        activeStartupAd={activeStartupAd}
        setActiveStartupAd={setActiveStartupAd}
        styles={styles}
        tokens={tokens}
      />
    </Modal>
  );
}
