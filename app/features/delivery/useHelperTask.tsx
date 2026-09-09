import { useHelperTaskInsets } from "./useHelperTaskInsets";
import { useHelperTaskSuggestedLow } from "./useHelperTaskSuggestedLow";
import { useHelperTaskHandleSearch } from "./useHelperTaskHandleSearch";
import { useHelperTaskHandleIncreasePrice } from "./useHelperTaskHandleIncreasePrice";
import { useHelperTaskCreateTask } from "./useHelperTaskCreateTask";

// State, data loading and handlers for app/helper-task.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useHelperTask() {
  const { insets, tokens, accent, styles, radius, driver, currentCoords, setOrderId, setDriver, setServiceType, step, setStep, taskType, setTaskType, pickupLocation, setPickupLocation, dropoffLocation, setDropoffLocation, pickupCoords, setPickupCoords, dropoffCoords, setDropoffCoords, activeField, setActiveField, searchResults, setSearchResults, isPickupValid, setIsPickupValid, isDropoffValid, setIsDropoffValid, durationMode, setDurationMode, customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription, offer, setOffer, isCreating, setIsCreating, localOrderId, setLocalOrderId, isIncreasingPrice, setIsIncreasingPrice, currentTaskPrice, setCurrentTaskPrice, rejectedCount, setRejectedCount, totalContacted, setTotalContacted, startOtp, setStartOtp, assignedDriver, setAssignedDriver, totalHours, calculatedFare } = useHelperTaskInsets();
  const { suggestedLow, suggestedHigh, handleUseCurrentLocation } = useHelperTaskSuggestedLow(setDriver, step, setStep, setPickupLocation, setPickupCoords, setIsPickupValid, localOrderId, setCurrentTaskPrice, setRejectedCount, setTotalContacted, setStartOtp, setAssignedDriver, calculatedFare);
  const { handleSearch, selectResult } = useHelperTaskHandleSearch(radius, currentCoords, setPickupLocation, setDropoffLocation, setPickupCoords, setDropoffCoords, activeField, setActiveField, setSearchResults, setIsPickupValid, setIsDropoffValid);
  const { handleIncreasePrice, handleCancel, goToBidding } = useHelperTaskHandleIncreasePrice(setOrderId, setStep, pickupCoords, isPickupValid, description, setOffer, localOrderId, setLocalOrderId, setIsIncreasingPrice, setCurrentTaskPrice, setAssignedDriver, calculatedFare);
  const { createTask, isProceedDisabled, activeDriver } = useHelperTaskCreateTask(driver, setOrderId, setDriver, setServiceType, setStep, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, isPickupValid, isDropoffValid, description, offer, setIsCreating, setLocalOrderId, setCurrentTaskPrice, assignedDriver, setAssignedDriver, totalHours, calculatedFare);

  return {
  insets, tokens, accent, styles, step, setStep, taskType, setTaskType, pickupLocation,
  dropoffLocation, activeField, setActiveField, searchResults, durationMode, setDurationMode,
  customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription,
  offer, setOffer, isCreating, isIncreasingPrice, currentTaskPrice, rejectedCount, totalContacted,
  startOtp, totalHours, calculatedFare, suggestedLow, suggestedHigh, handleUseCurrentLocation,
  handleSearch, selectResult, handleIncreasePrice, handleCancel, goToBidding, createTask,
  isProceedDisabled, activeDriver
  };
}

