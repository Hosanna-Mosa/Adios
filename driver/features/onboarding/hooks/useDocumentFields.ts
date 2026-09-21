import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

export type DocumentFields = ReturnType<typeof useDocumentFields>;

export function useDocumentFields() {
  const [dlNumber, setDlNumber] = useState("");
  const [dlExpiry, setDlExpiry] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dlExpiryDate, setDlExpiryDate] = useState(new Date());
  const [bankAccount, setBankAccount] = useState("");
  const [bankConfirm, setBankConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankVerified, setBankVerified] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === "ios");
      if (selectedDate) {
        setDlExpiryDate(selectedDate);
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const year = selectedDate.getFullYear();
        setDlExpiry(`${day}/${month}/${year}`);
      }
    },
    [],
  );

  return {
    dlNumber, setDlNumber,
    dlExpiry, setDlExpiry,
    showDatePicker, setShowDatePicker,
    dlExpiryDate, setDlExpiryDate,
    handleDateChange,
    bankAccount, setBankAccount,
    bankConfirm, setBankConfirm,
    ifsc, setIfsc,
    bankVerified, setBankVerified,
    selfieCaptured, setSelfieCaptured,
  };
}
