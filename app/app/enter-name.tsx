import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { showAlert } from "@/components/ui/AppAlert";
import { useAuthStore } from "@/contexts/authStore";
import { SingleFieldStep } from "@/features/auth/components/SingleFieldStep";

// After a phone code checks out for a number with no account: ask for a name, then the
// account is created and the user lands in the app. The ticket proves the phone was verified.
export default function EnterNameScreen() {
  const { t } = useTranslation();
  const { ticket } = useLocalSearchParams<{ ticket?: string }>();
  const completeSignup = useAuthStore((s) => s.completeSignup);
  const loading = useAuthStore((s) => s.loading);
  const [name, setName] = useState("");
  const trimmed = name.trim();

  const submit = async () => {
    if (!trimmed || !ticket) return;
    try {
      await completeSignup(ticket, { name: trimmed }, "otp");
      router.replace("/(tabs)");
    } catch (error: any) {
      showAlert(t("app.auth.signupFailed", "Couldn't create your account"), error.message || t("app.ride.pleaseTryAgain"));
    }
  };

  return (
    <SingleFieldStep
      title={t("app.auth.enterYourNameTitle", "Please enter your name")}
      subtitle={t("app.auth.enterYourNameSub", "We'll use it to greet you and for your orders.")}
      value={name}
      onChangeText={setName}
      placeholder={t("app.auth.fullName", "Full name")}
      canSubmit={!!trimmed && !!ticket}
      loading={loading}
      onSubmit={submit}
      onBack={() => router.replace("/login")}
      inputProps={{ autoCapitalize: "words", autoComplete: "name", textContentType: "name", maxLength: 60 }}
    />
  );
}
