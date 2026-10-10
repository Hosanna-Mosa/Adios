import { useHelperTaskInsets } from "./useHelperTaskInsets";
import { useHelperTaskSuggestedLow } from "./useHelperTaskSuggestedLow";
import { useHelperTaskLiveStatus } from "./useHelperTaskLiveStatus";
import { useHelperTaskHandleSearch } from "./useHelperTaskHandleSearch";
import { useHelperTaskHandleIncreasePrice } from "./useHelperTaskHandleIncreasePrice";
import { useHelperTaskCreateTask } from "./useHelperTaskCreateTask";
import { useHelperTaskHandleBack } from "./useHelperTaskHandleBack";
import { useHelperTaskResume } from "./useHelperTaskResume";

// State, data loading and handlers for app/helper-task.tsx, split into small hooks
// that always run in the same order.

export function useHelperTask() {
  const state = useHelperTaskInsets();
  const { clearTask, insets, tokens, accent, styles, driver, setOrderId, setDriver, setServiceType, setStatus, step, setStep, pickupLocation, setPickupLocation, dropoffLocation, setDropoffLocation, pickupCoords, setPickupCoords, dropoffCoords, setDropoffCoords, activeField, setActiveField, searchResults, setSearchResults, isPickupValid, setIsPickupValid, isDropoffValid, setIsDropoffValid, durationMode, setDurationMode, customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription, offer, setOffer, isCreating, setIsCreating, localOrderId, setLocalOrderId, orderPaymentMethod, setOrderPaymentMethod, isIncreasingPrice, setIsIncreasingPrice, currentTaskPrice, setCurrentTaskPrice, rejectedCount, setRejectedCount, totalContacted, setTotalContacted, startOtp, setStartOtp, assignedDriver, setAssignedDriver, searchExhausted, setSearchExhausted, searchStartedAt, setSearchStartedAt, isResuming, totalHours, quote, isQuoting, quoteError, calculatedFare } = state;
  useHelperTaskResume(state);
  const { suggestedLow, suggestedHigh, handleUseCurrentLocation } = useHelperTaskSuggestedLow(quote, setPickupLocation, setPickupCoords, setIsPickupValid);
  useHelperTaskLiveStatus(step, setStep, localOrderId, setDriver, setServiceType, setStatus, setCurrentTaskPrice, setRejectedCount, setTotalContacted, setStartOtp, setAssignedDriver, setSearchExhausted, setOrderPaymentMethod, clearTask);
  const { handleSearch, selectResult } = useHelperTaskHandleSearch(setPickupLocation, setDropoffLocation, setPickupCoords, setDropoffCoords, activeField, setActiveField, setSearchResults, setIsPickupValid, setIsDropoffValid);
  const { handleIncreasePrice, handleCancel, cancelTask, goToOffer } = useHelperTaskHandleIncreasePrice(setStep, pickupCoords, isPickupValid, description, setOffer, localOrderId, orderPaymentMethod, setOrderPaymentMethod, setIsIncreasingPrice, setCurrentTaskPrice, setSearchExhausted, quote, isQuoting, quoteError, clearTask);
  const { createTask, isProceedDisabled, activeDriver } = useHelperTaskCreateTask(driver, setOrderId, setServiceType, setStatus, setStep, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, isPickupValid, isDropoffValid, description, offer, setIsCreating, setLocalOrderId, setOrderPaymentMethod, setCurrentTaskPrice, assignedDriver, setSearchExhausted, setSearchStartedAt, totalHours, calculatedFare);
  const { handleBack } = useHelperTaskHandleBack(step, setStep, cancelTask, clearTask);

  return {
  insets, tokens, accent, styles, step, pickupLocation,
  dropoffLocation, activeField, setActiveField, searchResults, durationMode, setDurationMode,
  customHours, setCustomHours, customMinutes, setCustomMinutes, description, setDescription,
  offer, setOffer, isCreating, isIncreasingPrice, currentTaskPrice, rejectedCount, totalContacted,
  startOtp, searchExhausted, searchStartedAt, totalHours, calculatedFare, quote, isQuoting, quoteError,
  suggestedLow, suggestedHigh, handleUseCurrentLocation, isResuming, localOrderId,
  handleSearch, selectResult, handleIncreasePrice, handleCancel, handleBack, goToOffer, createTask,
  isProceedDisabled, activeDriver
  };
}
