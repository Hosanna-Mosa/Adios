import { DistanceSheet } from "@/features/home/components/DistanceSheet";
import { StartupAdModal } from "@/features/home/components/StartupAdModal";

// Markup moved out of (tabs)/index.tsx to keep the screen under 150 lines.
// The JSX is unchanged; each value it read is now a prop of the same name.

interface Props {
  insets: any;
  hasShownStartupAd: any;
  activeStartupAd: any;
  setActiveStartupAd: any;
  tokens: any;
  styles: any;
  isDistanceSheetOpen: any;
  setIsDistanceSheetOpen: any;
  distanceOption: any;
  setDistanceOption: any;
  customDistance: any;
  setCustomDistance: any;
  appliedDistanceKm: any;
  applyDistanceFilter: any;
  clearDistanceFilter: any;
}

export function IndexSection3({
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
