import { View } from "react-native";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { type ThemeTokens } from "@/constants/colors";

// The brand-coloured ground the intro splash sits on, shown while app/index.tsx
// waits for auth to restore or for the routing gate to move on. Same colour as
// the splash (and the native splash in app.config.js), so the hand-off never
// flashes a white screen.

interface Props {
  tokens: ThemeTokens;
  showLoader?: boolean;
}

export function LandingBrandBackdrop({ tokens, showLoader = false }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: tokens.brand, justifyContent: "center", alignItems: "center" }}>
      {showLoader && <FullScreenLoader color={tokens.onBrand} />}
    </View>
  );
}
