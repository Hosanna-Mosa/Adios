import { useState } from "react";

export type OrderVerification = ReturnType<typeof useOrderVerification>;

/** Checklists, pickup/delivery OTPs and the post-delivery rating form. */
export function useOrderVerification() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [sealedChecked, setSealedChecked] = useState(false);
  const [countChecked, setCountChecked] = useState(false);
  const [restaurantOTP, setRestaurantOTP] = useState("");
  const [restaurantOTPError, setRestaurantOTPError] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<"door" | "gate" | "contactless">("door");
  const [customerOTP, setCustomerOTP] = useState("");
  const [customerOTPError, setCustomerOTPError] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  return {
    checkedItems, setCheckedItems,
    sealedChecked, setSealedChecked,
    countChecked, setCountChecked,
    restaurantOTP, setRestaurantOTP,
    restaurantOTPError, setRestaurantOTPError,
    deliveryOption, setDeliveryOption,
    customerOTP, setCustomerOTP,
    customerOTPError, setCustomerOTPError,
    rating, setRating,
    feedback, setFeedback,
  };
}
