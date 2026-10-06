import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { usePayoutSummary, useRequestPayout } from "@/queries/payouts.queries";
import type { PayoutStatus } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { formatCurrency } from "@/utils/format";
import { amountInTransit, checkPayoutAmount, payoutBlocker } from "./payoutRules";
import { createStyles } from "./payouts.styles";

const SENT_TOAST: Record<PayoutStatus, string> = {
  processed: "payouts.sentToast",
  processing: "payouts.processingToast",
  pending: "payouts.requestedToast",
  failed: "payouts.requestedToast",
};

/** The Payouts screen: balance, bank account, history, and the request sheet. */
export function usePayouts() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const query = usePayoutSummary();
  const request = useRequestPayout();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);

  const summary = query.data?.payoutsEnabled ? query.data : null;
  const available = summary?.balance.availableBalance ?? 0;
  const minimum = summary?.minimumAmount ?? 0;
  const blockerKey = summary ? payoutBlocker(!!summary.bankAccount, available, minimum) : null;
  const blocker =
    blockerKey === "needsBank"
      ? t("payouts.needsBank")
      : blockerKey === "belowMinimum"
        ? t("payouts.belowMinimum", { amount: formatCurrency(minimum) })
        : null;

  const checked = checkPayoutAmount(amount, minimum, available);
  const parsedAmount = "amount" in checked ? checked.amount : null;

  const changeAmount = (value: string) => {
    setAmount(value);
    setAmountError(undefined);
  };

  const openRequest = () => {
    changeAmount(String(Math.floor(available)));
    setSheetOpen(true);
  };

  const submit = () => {
    if ("problem" in checked) {
      setAmountError(
        checked.problem === "tooLow"
          ? t("payouts.amountTooLow", { amount: formatCurrency(minimum) })
          : checked.problem === "tooHigh"
            ? t("payouts.amountTooHigh", { amount: formatCurrency(available) })
            : t("payouts.amountInvalid"),
      );
      return;
    }
    request.mutate(checked.amount, {
      onSuccess: (result) => {
        setSheetOpen(false);
        toast.show(t(SENT_TOAST[result?.payout?.status] ?? "payouts.requestedToast"), "success");
      },
      // The server re-checks everything (balance, bank account, one request at a time) — show its reason.
      onError: (error) => setAmountError(errorMessage(error, t("payouts.requestFailed"))),
    });
  };

  const refresh = async () => {
    setRefreshing(true);
    await query.refetch().catch(() => {});
    setRefreshing(false);
  };

  return {
    insets,
    tokens,
    styles,
    summary: query.data,
    loading: query.isLoading,
    error: query.isError && !query.data,
    retry: () => query.refetch(),
    inTransit: summary ? amountInTransit(summary.payouts) : 0,
    available,
    blocker,
    openRequest,
    sheet: {
      visible: sheetOpen,
      value: amount,
      error: amountError,
      parsedAmount,
      sending: request.isPending,
      changeAmount,
      withdrawAll: () => changeAmount(String(Math.floor(available))),
      submit,
      close: () => setSheetOpen(false),
    },
    refreshing,
    refresh,
  };
}
