import { DistanceSheet } from "@/features/home/components/DistanceSheet";
import { StartupAdModal } from "@/features/home/components/StartupAdModal";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HomeStyles } from "@/features/home/home.styles";

// Markup moved out of (tabs)/index.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

interface Props {
  insets: EdgeInsets;
  hasShownStartupAd: boolean;
  activeStartupAd: any;
  setActiveStartupAd: any;
  tokens: ThemeTokens;
  styles: HomeStyles;
  isDistanceSheetOpen: boolean;
  setIsDistanceSheetOpen: any;
  distanceOption: any;
  setDistanceOption: any;
  customDistance: any;
  setCustomDistance: any;
  appliedDistanceKm: any;
  applyDistanceFilter: any;
  clearDistanceFilter: () => void;
}

export function HomeSheetsAndAds({
  insets,
  hasShownStartupAd,
  activeStartupAd,
  setActiveStartupAd,
  tokens,
  styles,
  isDistanceSheetOpen,
  setIsDistanceSheetOpen,
  distanceOption,
  setDistanceOption,
  customDistance,
  setCustomDistance,
  appliedDistanceKm,
  applyDistanceFilter,
  clearDistanceFilter,
}: Props) {
  return (
    <>
    <DistanceSheet
      appliedDistanceKm={appliedDistanceKm}
      applyDistanceFilter={applyDistanceFilter}
      clearDistanceFilter={clearDistanceFilter}
      customDistance={customDistance}
      distanceOption={distanceOption}
      insets={insets}
      isDistanceSheetOpen={isDistanceSheetOpen}
      setCustomDistance={setCustomDistance}
      setDistanceOption={setDistanceOption}
      setIsDistanceSheetOpen={setIsDistanceSheetOpen}
      styles={styles}
      tokens={tokens}
    />

    {/* Startup ad */}
    {activeStartupAd && (
      <StartupAdModal
        activeStartupAd={activeStartupAd}
        hasShownStartupAd={hasShownStartupAd}
        setActiveStartupAd={setActiveStartupAd}
        styles={styles}
        tokens={tokens}
      />
    )}

    {/* Filter modal */}
    </>
  );
}
