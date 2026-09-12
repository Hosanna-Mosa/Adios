import * as React from "react";
import { useState } from "react";
import { TextInput } from "react-native";

/** The six OTP boxes: typing advances, backspace steps back.
 * Split out of useAuthFlow to keep both files under 150 lines. */
export function useOtpInput(onComplete: (code: string) => void) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = React.useRef<(TextInput | null)[]>([]);

  const handleOTPChange = (text: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);
    if (text && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    if (idx === 5 && text) {
      const fullOtp = [...newOtp].join("");
      onComplete(fullOtp);
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  return { otp, setOtp, otpRefs, handleOTPChange, handleKeyPress };
}
