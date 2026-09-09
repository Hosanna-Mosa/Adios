import { ScrollView } from "react-native";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { AddStopFooter } from "@/features/delivery/components/AddStopFooter";
import { AddStopSection } from "@/features/delivery/components/AddStopSection";
import { AddStopSection2 } from "@/features/delivery/components/AddStopSection2";
import { AddStopSection3 } from "@/features/delivery/components/AddStopSection3";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useAddStop } from "@/features/delivery/useAddStop";

export default function AddStopScreen() {
  const {
  insets, tokens, accent, styles, address, addressInput, storeName, setStoreName, items,
  newItemName, setNewItemName, newItemPrice, setNewItemPrice, nearbySuggestions,
  autocompleteSuggestions, isSearching, showDropdown, setShowDropdown, previewDelta, isPreviewing,
  currentCoords, stops, route, price, handleAddressInput, handleSelectSuggestion, handleAddStop,
  addItemToLocal, removeItemFromLocal
  } = useAddStop();

  return (
    <ScreenShell keyboardAvoiding>
      <Header
        title={`Add stop ${stops.length + 1}`}
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <AddStopSection
          accent={accent}
          address={address}
          addressInput={addressInput}
          autocompleteSuggestions={autocompleteSuggestions}
          handleAddressInput={handleAddressInput}
          handleSelectSuggestion={handleSelectSuggestion}
          isSearching={isSearching}
          setShowDropdown={setShowDropdown}
          setStoreName={setStoreName}
          showDropdown={showDropdown}
          storeName={storeName}
          styles={styles}
          tokens={tokens}
        />

        <AddStopSection2
          accent={accent}
          addItemToLocal={addItemToLocal}
          items={items}
          newItemName={newItemName}
          newItemPrice={newItemPrice}
          removeItemFromLocal={removeItemFromLocal}
          setNewItemName={setNewItemName}
          setNewItemPrice={setNewItemPrice}
          styles={styles}
          tokens={tokens}
        />

        {nearbySuggestions.length > 0 && (
          <AddStopSection3
            formatDistance={formatDistance}
            getDistanceMeters={getDistanceMeters}
            accent={accent}
            currentCoords={currentCoords}
            handleSelectSuggestion={handleSelectSuggestion}
            nearbySuggestions={nearbySuggestions}
            styles={styles}
          />
        )}
      </ScrollView>

      <AddStopFooter
        address={address}
        handleAddStop={handleAddStop}
        insets={insets}
        isPreviewing={isPreviewing}
        items={items}
        previewDelta={previewDelta}
        price={price}
        route={route}
        styles={styles}
      />
    </ScreenShell>
  );
}

const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (meters: number) => (meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`);
