import { useState } from "react";

export type OrderVerification = ReturnType<typeof useOrderVerification>;

/** Checklists, pickup/delivery OTPs and the post-delivery rating form. */
export function useOrderVerification() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [sealedChecked, setSealedChecked] = useState(false);
  const [restaurantOTP, setRestaurantOTP] = useState("");
  const [restaurantOTPError, setRestaurantOTPError] = useState(false);
  const [customerOTP, setCustomerOTP] = useState("");
  const [customerOTPError, setCustomerOTPError] = useState(false);
  // The server's reason when it turned a code down (helper tasks check codes only there).
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  return {
    checkedItems, setCheckedItems,
    sealedChecked, setSealedChecked,
    restaurantOTP, setRestaurantOTP,
    restaurantOTPError, setRestaurantOTPError,
    customerOTP, setCustomerOTP,
    customerOTPError, setCustomerOTPError,
    otpErrorMessage, setOtpErrorMessage,
    rating, setRating,
    feedback, setFeedback,
  };
}
