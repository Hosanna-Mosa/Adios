import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePartner } from "@/contexts/authStore";
import { getPayoutSummary, requestPayout } from "@/services/payouts.service";
import { queryKeys } from "./keys";

/** Balance, bank account and payout history for the signed-in outlet. */
export function usePayoutSummary() {
  const partner = usePartner();
  return useQuery({
    queryKey: queryKeys.payouts(partner?._id ?? ""),
    queryFn: getPayoutSummary,
    enabled: !!partner,
  });
}

/** Requests a payout; the summary reloads either way, since a failed request can still have been recorded. */
export function useRequestPayout() {
  const partner = usePartner();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => requestPayout(amount),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.payouts(partner?._id ?? "") }),
  });
}
