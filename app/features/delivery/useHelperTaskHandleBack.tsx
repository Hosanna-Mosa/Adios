import { useCallback, useRef } from "react";
import { BackHandler } from "react-native";
import { useTranslation } from "react-i18next";
import { router, useFocusEffect } from "expo-router";
import { showAlert } from "@/components/ui/AppAlert";

// Back on the helper screen. Once the task is posted, back never quietly resets the
// form: the order is live on the server, so the customer either cancels it or leaves
// it running and comes back to it from the active-order stripe or My Orders.

export function useHelperTaskHandleBack(step: any, setStep: any, cancelTask: () => Promise<boolean>, clearTask: () => void) {
  const { t } = useTranslation();

  const leave = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)"));

  const handleBack = () => {
    if (step === "compose") return leave();
    if (step === "offer") return setStep("compose");
    // Neither button is the "cancel" style, so tapping outside the dialog doesn't pick one.
    showAlert(t("app.delivery.cancelThisRequest"), t("app.delivery.cancelThisRequestHint"), [
      { text: t("app.delivery.keepIt"), onPress: leave },
      {
        text: t("app.delivery.cancelRequest"),
        style: "destructive",
        onPress: async () => {
          if (!(await cancelTask())) return;
          clearTask();
          leave();
        },
      },
    ]);
  };

  // Android's hardware back follows the on-screen arrow.
  const latest = useRef(handleBack);
  latest.current = handleBack;
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        latest.current();
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  return { handleBack };
}
