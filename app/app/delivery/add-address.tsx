import { AddressFormPane } from "@/features/delivery/components/AddressFormPane";
import { StyleSheet, View, Platform } from "react-native";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "@/components/maps";
import { AddAddressBottomCard } from "@/features/delivery/components/AddAddressBottomCard";
import { AddAddressCenterMarker } from "@/features/delivery/components/AddAddressCenterMarker";
import { AddAddressUseCurrentWrap } from "@/features/delivery/components/AddAddressUseCurrentWrap";
import { AddAddressSearchResults } from "@/features/delivery/components/AddAddressSearchResults";
import { AddAddressSearchRow } from "@/features/delivery/components/AddAddressSearchRow";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useAddAddress } from "@/features/delivery/useAddAddress";

export default function AddAddressScreen() {
  const {
  insets, router, mapRef, searchInputRef, tokens, accent, styles, isEditMode, selectedChip,
  setSelectedChip, label, setLabel, addressLine, setAddressLine, completeAddress,
  setCompleteAddress, instructions, setInstructions, receiverName, setReceiverName, receiverPhone,
  setReceiverPhone, landmark, setLandmark, shortAddress, cityOrCountry, loading, step, setStep,
  region, searchQuery, searchResults, searching, isResolvingAddress, latLabel, lngLabel,
  handleUseCurrentLocation, onRegionChangeComplete, handleSearch, handleSelectSearchResult,
  handleSave
  } = useAddAddress();

  return (
    <ScreenShell keyboardAvoiding>
      {step === 1 ? (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            style={StyleSheet.absoluteFill}
            initialRegion={region}
            onRegionChangeComplete={onRegionChangeComplete}
            showsUserLocation
            showsMyLocationButton={false}
          />

          <AddAddressSearchRow
            accent={accent}
            handleSearch={handleSearch}
            insets={insets}
            router={router}
            searchInputRef={searchInputRef}
            searchQuery={searchQuery}
            searching={searching}
            styles={styles}
            tokens={tokens}
          />

          {searchResults.length > 0 && (
            <AddAddressSearchResults
              handleSelectSearchResult={handleSelectSearchResult}
              insets={insets}
              searchResults={searchResults}
              styles={styles}
            />
          )}

          <AddAddressUseCurrentWrap
            accent={accent}
            handleUseCurrentLocation={handleUseCurrentLocation}
            styles={styles}
          />

          <AddAddressCenterMarker
            isResolvingAddress={isResolvingAddress}
            styles={styles}
            tokens={tokens}
          />

          <AddAddressBottomCard
            accent={accent}
            cityOrCountry={cityOrCountry}
            insets={insets}
            isResolvingAddress={isResolvingAddress}
            latLabel={latLabel}
            lngLabel={lngLabel}
            searchInputRef={searchInputRef}
            setStep={setStep}
            shortAddress={shortAddress}
            styles={styles}
          />
        </View>
      ) : (
        <AddressFormPane
          MapView={MapView}
          PROVIDER_DEFAULT={PROVIDER_DEFAULT}
          PROVIDER_GOOGLE={PROVIDER_GOOGLE}
          accent={accent}
          addressLine={addressLine}
          completeAddress={completeAddress}
          handleSave={handleSave}
          handleUseCurrentLocation={handleUseCurrentLocation}
          insets={insets}
          instructions={instructions}
          isEditMode={isEditMode}
          isResolvingAddress={isResolvingAddress}
          label={label}
          landmark={landmark}
          latLabel={latLabel}
          lngLabel={lngLabel}
          loading={loading}
          receiverName={receiverName}
          receiverPhone={receiverPhone}
          region={region}
          router={router}
          selectedChip={selectedChip}
          setAddressLine={setAddressLine}
          setCompleteAddress={setCompleteAddress}
          setInstructions={setInstructions}
          setLabel={setLabel}
          setLandmark={setLandmark}
          setReceiverName={setReceiverName}
          setReceiverPhone={setReceiverPhone}
          setSelectedChip={setSelectedChip}
          setStep={setStep}
          shortAddress={shortAddress}
          styles={styles}
          tokens={tokens}
        />
      )}
    </ScreenShell>
  );
}
