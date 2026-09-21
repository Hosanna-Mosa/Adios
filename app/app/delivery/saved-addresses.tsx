import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { SavedAddressRow } from "@/features/delivery/components/SavedAddressRow";
import { SavedAddressesList } from "@/features/delivery/components/SavedAddressesList";
import { RecentAddressesList } from "@/features/delivery/components/RecentAddressesList";
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
          <SavedAddressRow
            accent={accent}
            currentLocLoading={currentLocLoading}
            handleUseCurrentLocation={handleUseCurrentLocation}
            selectingId={selectingId}
            styles={styles}
          />

          <SavedAddressesList
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
            <RecentAddressesList
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
