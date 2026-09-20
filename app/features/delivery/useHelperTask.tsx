import { useHelperTaskInsets } from "./useHelperTaskInsets";
import { useHelperTaskSuggestedLow } from "./useHelperTaskSuggestedLow";
import { useHelperTaskHandleSearch } from "./useHelperTaskHandleSearch";
import { useHelperTaskHandleIncreasePrice } from "./useHelperTaskHandleIncreasePrice";
import { useHelperTaskCreateTask } from "./useHelperTaskCreateTask";

// State, data loading and handlers for app/helper-task.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useHelperTask() {
  const { insets, tokens, accent, styles, radius, driver, currentCoords, setOrderId, setDriver, setServiceType, setStatus, step, setStep, pickupLocation, setPickupLocation, dropoffLocation, setDropoffLocation, pickupCoords, setPickupCoords, dropoffCoords, setDropoffCoords, activeField, setActiveField, searchResults, setSearchResults, isPickupValid, setIsPickupValid, isDropoffValid, setIsDropoffValid, durationMode, setDurationMode, customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription, offer, setOffer, isCreating, setIsCreating, localOrderId, setLocalOrderId, isIncreasingPrice, setIsIncreasingPrice, currentTaskPrice, setCurrentTaskPrice, rejectedCount, setRejectedCount, totalContacted, setTotalContacted, startOtp, setStartOtp, assignedDriver, setAssignedDriver, searchExhausted, setSearchExhausted, searchStartedAt, setSearchStartedAt, totalHours, calculatedFare } = useHelperTaskInsets();
  const { suggestedLow, suggestedHigh, handleUseCurrentLocation } = useHelperTaskSuggestedLow(setDriver, setServiceType, step, setStep, setPickupLocation, setPickupCoords, setIsPickupValid, localOrderId, setCurrentTaskPrice, setRejectedCount, setTotalContacted, setStartOtp, setAssignedDriver, setSearchExhausted, calculatedFare);
  const { handleSearch, selectResult } = useHelperTaskHandleSearch(radius, currentCoords, setPickupLocation, setDropoffLocation, setPickupCoords, setDropoffCoords, activeField, setActiveField, setSearchResults, setIsPickupValid, setIsDropoffValid);
  const { handleIncreasePrice, handleCancel, goToBidding } = useHelperTaskHandleIncreasePrice(setOrderId, setStep, pickupCoords, isPickupValid, description, setOffer, localOrderId, setLocalOrderId, setIsIncreasingPrice, setCurrentTaskPrice, setAssignedDriver, setSearchExhausted, calculatedFare);
  const { createTask, isProceedDisabled, activeDriver } = useHelperTaskCreateTask(driver, setOrderId, setDriver, setServiceType, setStatus, setStep, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, isPickupValid, isDropoffValid, description, offer, setIsCreating, setLocalOrderId, setCurrentTaskPrice, assignedDriver, setAssignedDriver, setSearchExhausted, setSearchStartedAt, totalHours, calculatedFare);

  return {
  insets, tokens, accent, styles, step, setStep, pickupLocation,
  dropoffLocation, activeField, setActiveField, searchResults, durationMode, setDurationMode,
  customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription,
  offer, setOffer, isCreating, isIncreasingPrice, currentTaskPrice, rejectedCount, totalContacted,
  startOtp, searchExhausted, searchStartedAt, totalHours, calculatedFare, suggestedLow,
  suggestedHigh, handleUseCurrentLocation,
  handleSearch, selectResult, handleIncreasePrice, handleCancel, goToBidding, createTask,
  isProceedDisabled, activeDriver
  };
}

