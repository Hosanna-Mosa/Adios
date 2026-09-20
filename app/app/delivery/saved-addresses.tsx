import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { SavedAddressesSection } from "@/features/delivery/components/SavedAddressesSection";
import { SavedAddressesSection2 } from "@/features/delivery/components/SavedAddressesSection2";
import { SavedAddressesSection3 } from "@/features/delivery/components/SavedAddressesSection3";
import { SavedAddressesEmptyWrap } from "@/features/delivery/components/SavedAddressesEmptyWrap";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useSavedAddresses } from "@/features/delivery/useSavedAddresses";

export default function SavedAddressesScreen() {
  const {
  insets, tokens, accent, styles, addresses, loading, selectingId, deletingId, recentLocations,
  recentLoading, currentLocLoading, handleUseCurrentLocation, handleSelectRecentLocation,
  handleSelectAddress, handleMoreOptions, parseInstructions, stripMeta, isEmpty
  } = useSavedAddresses();

  return (
    <ScreenShell keyboardAvoiding>
      <Header
        title="Places"
        onBack={() => router.back()}
        backDisabled={selectingId !== null}
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
      />

      {isEmpty ? (
        <SavedAddressesEmptyWrap
          accent={accent}
          addresses={addresses}
          currentLocLoading={currentLocLoading}
          handleUseCurrentLocation={handleUseCurrentLocation}
          styles={styles}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <SavedAddressesSection
            accent={accent}
            currentLocLoading={currentLocLoading}
            handleUseCurrentLocation={handleUseCurrentLocation}
            selectingId={selectingId}
            styles={styles}
          />

          <SavedAddressesSection2
            accent={accent}
            addresses={addresses}
            deletingId={deletingId}
            handleMoreOptions={handleMoreOptions}
            handleSelectAddress={handleSelectAddress}
            loading={loading}
            parseInstructions={parseInstructions}
            selectingId={selectingId}
            stripMeta={stripMeta}
            styles={styles}
            tokens={tokens}
          />

          {(recentLoading || recentLocations.length > 0) && (
            <SavedAddressesSection3
              accent={accent}
              handleSelectRecentLocation={handleSelectRecentLocation}
              recentLoading={recentLoading}
              recentLocations={recentLocations}
              selectingId={selectingId}
              styles={styles}
              tokens={tokens}
            />
          )}
        </ScrollView>
      )}
    </ScreenShell>
  );
}
