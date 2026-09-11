import { Platform, KeyboardAvoidingView, Modal } from "react-native";
import { RouteInputCard } from "@/features/ride/components/RouteInputCard";
import { DropActionRow } from "@/features/ride/components/DropActionRow";
import { PlacesList } from "@/features/ride/components/PlacesList";
import { BookingForSheet } from "@/features/ride/components/BookingForSheet";
import { DropLocationLoadingOverlay } from "@/features/ride/components/DropLocationLoadingOverlay";
import { DropLocationHeader } from "@/features/ride/components/DropLocationHeader";
import { useLocationSelection } from "@/features/ride/useLocationSelection";

export default function LocationSelectionScreen() {
  const {
  insets, serviceId, name, tokens, accent, styles, user, pickup, drop, stops, showBookingForSheet,
  setShowBookingForSheet, bookingFor, setBookingFor, someoneContact, setSomeoneContact,
  recentPlaces, savedAddresses, savingPreference, setSavingPreference, isNavigating,
  fetchingLocation, searchResults, isSearching, searchLoading, searchText, searchError,
  setFocusedInput, pickupRef, dropRef, handleSearch, selectResult, handleSelection, handleAddStop,
  handleRemoveStop, handleStopSelection, selectSavedAddress, handleCurrentLocation
  } = useLocationSelection();

  return (
    <>
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.root}
    >
      <DropLocationHeader
        bookingFor={bookingFor}
        insets={insets}
        name={name}
        setShowBookingForSheet={setShowBookingForSheet}
        styles={styles}
        tokens={tokens}
      />

      <RouteInputCard
        accent={accent}
        drop={drop}
        dropRef={dropRef}
        fetchingLocation={fetchingLocation}
        handleCurrentLocation={handleCurrentLocation}
        handleRemoveStop={handleRemoveStop}
        handleSearch={handleSearch}
        handleSelection={handleSelection}
        handleStopSelection={handleStopSelection}
        pickup={pickup}
        pickupRef={pickupRef}
        setFocusedInput={setFocusedInput}
        stops={stops}
        styles={styles}
        tokens={tokens}
      />

      <DropActionRow
        serviceId={serviceId}
        drop={drop}
        handleAddStop={handleAddStop}
        pickup={pickup}
        styles={styles}
        tokens={tokens}
      />

      <PlacesList
        drop={drop}
        dropRef={dropRef}
        handleSelection={handleSelection}
        isSearching={isSearching}
        pickup={pickup}
        pickupRef={pickupRef}
        recentPlaces={recentPlaces}
        savedAddresses={savedAddresses}
        searchError={searchError}
        searchLoading={searchLoading}
        searchResults={searchResults}
        searchText={searchText}
        selectResult={selectResult}
        selectSavedAddress={selectSavedAddress}
        styles={styles}
        tokens={tokens}
      />

      {isNavigating && (
        <DropLocationLoadingOverlay
          accent={accent}
          styles={styles}
        />
      )}
    </KeyboardAvoidingView>

    <Modal
      visible={showBookingForSheet}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBookingForSheet(false)}
    >
      <BookingForSheet
        user={user}
        accent={accent}
        bookingFor={bookingFor}
        insets={insets}
        savingPreference={savingPreference}
        setBookingFor={setBookingFor}
        setSavingPreference={setSavingPreference}
        setShowBookingForSheet={setShowBookingForSheet}
        setSomeoneContact={setSomeoneContact}
        someoneContact={someoneContact}
        styles={styles}
        tokens={tokens}
      />
    </Modal>
    </>
  );
}
