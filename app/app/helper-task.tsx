import { useTranslation } from "react-i18next";
import { TaskComposeForm } from "@/features/delivery/components/TaskComposeForm";
import { TaskBiddingPanel } from "@/features/delivery/components/TaskBiddingPanel";
import { TaskAssignedPanel } from "@/features/delivery/components/TaskAssignedPanel";
import { View, ScrollView, Linking } from "react-native";
import { router, Stack } from "expo-router";
import { Header } from "@/components/ui/Header";
import { fadeIn } from "@/motion/presets";
import { HelperTaskSection } from "@/features/delivery/components/HelperTaskSection";
import { HelperTaskOfferBlock } from "@/features/delivery/components/HelperTaskOfferBlock";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { HelperTaskBody } from "@/features/delivery/components/HelperTaskBody";
import { useHelperTask } from "@/features/delivery/useHelperTask";

export default function HelperTaskScreen() {
  const {
  insets, tokens, accent, styles, step, setStep, pickupLocation,
  dropoffLocation, activeField, setActiveField, searchResults, durationMode, setDurationMode,
  customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription,
  offer, setOffer, isCreating, isIncreasingPrice, currentTaskPrice, rejectedCount, totalContacted,
  startOtp, searchExhausted, searchStartedAt, totalHours, calculatedFare, suggestedLow,
  suggestedHigh, handleUseCurrentLocation,
  handleSearch, selectResult, handleIncreasePrice, handleCancel, goToBidding, createTask,
  isProceedDisabled, activeDriver
  } = useHelperTask();
  const { t } = useTranslation();

  return (
    <ScreenShell>
      <Stack.Screen options={{ headerShown: false }} />
      <Header
        title={step === "compose" ? t("app.helperTask.title.compose") : step === "bidding" ? t("app.helperTask.title.bidding") : step === "searching" ? (searchExhausted ? t("app.helperTask.title.noHelpersYet") : t("app.helperTask.title.searching")) : t("app.helperTask.title.assigned")}
        onBack={() => (step === "compose" ? router.back() : setStep("compose"))}
        style={{ paddingTop: insets.top + 6, paddingBottom: 10 }}
        entering={fadeIn(0)}
      />

      {step === "compose" && (
        <TaskComposeForm
          accent={accent}
          activeField={activeField}
          calculatedFare={calculatedFare}
          customHours={customHours}
          customMinutes={customMinutes}
          description={description}
          dropoffLocation={dropoffLocation}
          durationMode={durationMode}
          goToBidding={goToBidding}
          handleSearch={handleSearch}
          handleUseCurrentLocation={handleUseCurrentLocation}
          insets={insets}
          isProceedDisabled={isProceedDisabled}
          offer={offer}
          pickupLocation={pickupLocation}
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

      {step === "bidding" && (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <HelperTaskOfferBlock
              calculatedFare={calculatedFare}
              offer={offer}
              styles={styles}
              totalHours={totalHours}
            />

            <HelperTaskSection
              accent={accent}
              calculatedFare={calculatedFare}
              setOffer={setOffer}
              styles={styles}
            />
          </ScrollView>

          <TaskBiddingPanel
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

      {step === "searching" && (
        <HelperTaskBody
          accent={accent}
          calculatedFare={calculatedFare}
          currentTaskPrice={currentTaskPrice}
          handleCancel={handleCancel}
          handleIncreasePrice={handleIncreasePrice}
          insets={insets}
          isIncreasingPrice={isIncreasingPrice}
          offer={offer}
          rejectedCount={rejectedCount}
          searchExhausted={searchExhausted}
          searchStartedAt={searchStartedAt}
          styles={styles}
          tokens={tokens}
          totalContacted={totalContacted}
        />
      )}

      {step === "assigned" && activeDriver && (
        <TaskAssignedPanel
          Linking={Linking}
          activeDriver={activeDriver}
          currentTaskPrice={currentTaskPrice}
          dropoffLocation={dropoffLocation}
          handleCancel={handleCancel}
          insets={insets}
          offer={offer}
          pickupLocation={pickupLocation}
          startOtp={startOtp}
          styles={styles}
          tokens={tokens}
        />
      )}
    </ScreenShell>
  );
}

