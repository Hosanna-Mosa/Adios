import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { showAlert } from "@/components/ui/AppAlert";
import { useAuthStore } from "@/contexts/authStore";
import { SingleFieldStep } from "@/features/auth/components/SingleFieldStep";

// After an emailed code checks out for an address with no account: ask for a phone number
// (instead of a name), then the account is created. The ticket proves the email was verified.
export default function EnterPhoneScreen() {
  const { t } = useTranslation();
  const { ticket } = useLocalSearchParams<{ ticket?: string }>();
  const completeSignup = useAuthStore((s) => s.completeSignup);
  const loading = useAuthStore((s) => s.loading);
  const [phone, setPhone] = useState("");
  const valid = phone.length === 10;

  const submit = async () => {
    if (!valid || !ticket) return;
    try {
      await completeSignup(ticket, { phone }, "email_otp");
      router.replace("/(tabs)");
    } catch (error: any) {
      showAlert(t("app.auth.signupFailed", "Couldn't create your account"), error.message || t("app.ride.pleaseTryAgain"));
    }
  };

  return (
    <SingleFieldStep
      title={t("app.auth.enterYourPhoneTitle", "Enter your phone number")}
      subtitle={t("app.auth.enterYourPhoneSub", "Delivery partners use it to reach you about your orders.")}
      value={phone}
      onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
      placeholder={t("app.auth.enterPhoneNumber", "Enter Phone Number")}
      prefix="+91"
      canSubmit={valid && !!ticket}
      loading={loading}
      onSubmit={submit}
      onBack={() => router.replace("/login")}
      inputProps={{ keyboardType: "phone-pad", maxLength: 10, autoComplete: "tel" }}
    />
  );
}
