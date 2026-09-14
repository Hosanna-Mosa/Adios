import { Modal } from "react-native";
import { HomeStartupAdOverlay } from "./HomeStartupAdOverlay";
import { StatusBarFill } from "@/components/StatusBarFill";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeStartupAd: any;
  hasShownStartupAd: any;
  setActiveStartupAd: any;
  styles: any;
  tokens: any;
}

export function StartupAdModal({
  activeStartupAd,
  hasShownStartupAd,
  setActiveStartupAd,
  styles,
  tokens,
}: Props) {
  return (
    <Modal statusBarTranslucent visible={hasShownStartupAd && !!activeStartupAd} transparent animationType="fade">
      <StatusBarFill />
      <HomeStartupAdOverlay
        activeStartupAd={activeStartupAd}
        setActiveStartupAd={setActiveStartupAd}
        styles={styles}
        tokens={tokens}
      />
    </Modal>
  );
}
