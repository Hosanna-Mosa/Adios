import { useTranslation } from "react-i18next";
import { TaskComposeForm } from "@/features/delivery/components/TaskComposeForm";
import { TaskOfferPanel } from "@/features/delivery/components/TaskOfferPanel";
import { TaskAssignedPanel } from "@/features/delivery/components/TaskAssignedPanel";
import { View, ScrollView, Linking } from "react-native";
import { Stack } from "expo-router";
import { Header } from "@/components/ui/Header";
import { fadeIn } from "@/motion/presets";
import { HelperTaskSection } from "@/features/delivery/components/HelperTaskSection";
import { HelperTaskOfferBlock } from "@/features/delivery/components/HelperTaskOfferBlock";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { HelperTaskBody } from "@/features/delivery/components/HelperTaskBody";
import { useHelperTask } from "@/features/delivery/useHelperTask";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";

export default function HelperTaskScreen() {
  const {
  insets, tokens, accent, styles, step, pickupLocation,
  dropoffLocation, activeField, setActiveField, searchResults, durationMode, setDurationMode,
  customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription,
  offer, setOffer, isCreating, isIncreasingPrice, currentTaskPrice, rejectedCount, totalContacted,
  startOtp, searchExhausted, searchStartedAt, totalHours, calculatedFare, quote, isQuoting, quoteError,
  suggestedLow, suggestedHigh, handleUseCurrentLocation, isResuming, localOrderId,
  handleSearch, selectResult, handleIncreasePrice, handleCancel, handleBack, goToOffer, createTask,
  isProceedDisabled, activeDriver
  } = useHelperTask();
  const { t } = useTranslation();

  return (
    <ScreenShell>
      {/* Swipe-back would leave a posted task without asking; the header arrow asks. */}
      <Stack.Screen options={{ headerShown: false, gestureEnabled: step === "compose" || step === "offer" }} />
      <Header
        title={step === "compose" ? t("app.helperTask.title.compose") : step === "offer" ? t("app.helperTask.title.offer") : step === "searching" ? (searchExhausted ? t("app.helperTask.title.noHelpersYet") : t("app.helperTask.title.searching")) : t("app.helperTask.title.assigned")}
        onBack={handleBack}
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
        entering={fadeIn(0)}
      />

      {isResuming && <FullScreenLoader color={accent.accent} style={{ flex: 1 }} />}

      {!isResuming && step === "compose" && (
        <TaskComposeForm
          accent={accent}
          activeField={activeField}
          calculatedFare={calculatedFare}
          customHours={customHours}
          customMinutes={customMinutes}
          description={description}
          dropoffLocation={dropoffLocation}
          durationMode={durationMode}
          goToOffer={goToOffer}
          handleSearch={handleSearch}
          handleUseCurrentLocation={handleUseCurrentLocation}
          insets={insets}
          isProceedDisabled={isProceedDisabled}
          isQuoting={isQuoting}
          pickupLocation={pickupLocation}
          quoteError={quoteError}
          searchResults={searchResults}
          selectResult={selectResult}
          setActiveField={setActiveField}
          setCustomHours={setCustomHours}
          setCustomMinutes={setCustomMinutes}
          setDescription={setDescription}
          setDurationMode={setDurationMode}
          styles={styles}
          suggestedHigh={suggestedHigh}
          suggestedLow={suggestedLow}
          tokens={tokens}
        />
      )}

      {!isResuming && step === "offer" && (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <HelperTaskOfferBlock
              calculatedFare={calculatedFare}
              offer={offer}
              quote={quote}
              styles={styles}
              totalHours={totalHours}
            />

            <HelperTaskSection
              accent={accent}
              calculatedFare={calculatedFare}
              offer={offer}
              quote={quote}
              setOffer={setOffer}
              styles={styles}
            />
          </ScrollView>

          <TaskOfferPanel
            accent={accent}
            calculatedFare={calculatedFare}
            createTask={createTask}
            insets={insets}
            isCreating={isCreating}
            offer={offer}
            styles={styles}
          />
        </View>
      )}

      {!isResuming && step === "searching" && (
        <HelperTaskBody
          accent={accent}
          calculatedFare={calculatedFare}
          currentTaskPrice={currentTaskPrice}
          handleCancel={handleCancel}
          handleIncreasePrice={handleIncreasePrice}
          insets={insets}
          isIncreasingPrice={isIncreasingPrice}
          maxOffer={quote?.maxOffer ?? null}
          offer={offer}
          rejectedCount={rejectedCount}
          searchExhausted={searchExhausted}
          searchStartedAt={searchStartedAt}
          styles={styles}
          tokens={tokens}
          totalContacted={totalContacted}
        />
      )}

      {!isResuming && step === "assigned" && activeDriver && (
        <TaskAssignedPanel
          Linking={Linking}
          activeDriver={activeDriver}
          currentTaskPrice={currentTaskPrice}
          dropoffLocation={dropoffLocation}
          handleCancel={handleCancel}
          insets={insets}
          offer={offer}
          orderId={localOrderId}
          pickupLocation={pickupLocation}
          startOtp={startOtp}
          styles={styles}
          tokens={tokens}
        />
      )}
    </ScreenShell>
  );
}

