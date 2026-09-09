import { useOTPInsets } from "./useOTPInsets";
import { useOTPHandleKeyPress } from "./useOTPHandleKeyPress";

// State, data loading and handlers for app/otp.tsx.
// Moved out of the screen unchanged and in the same order, so the hooks
// still run exactly as they did inline.

export function useOTP() {
  const { insets, phone, name, email, password, otp, setOtp, focusedIndex, setFocusedIndex, secondsLeft, setSecondsLeft, resending, setResending, inputs, verifyOTP, requestOTP, loading, tokens, accent, styles, handleChange } = useOTPInsets();
  const { handleKeyPress, handleVerify, handleResend, handleCallInstead, isFilled } = useOTPHandleKeyPress(phone, name, email, password, otp, setOtp, secondsLeft, setSecondsLeft, setResending, inputs, verifyOTP, requestOTP);

  return {
  insets, phone, name, otp, focusedIndex, setFocusedIndex, secondsLeft, resending, inputs,
  loading, tokens, accent, styles, handleChange, handleKeyPress, handleVerify, handleResend,
  handleCallInstead, isFilled
  };
}

