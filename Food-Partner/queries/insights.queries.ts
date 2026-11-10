import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/contexts/authStore";
import { createOffer, deleteOffer, getMyOffers, getSalesAnalytics, setOfferActive } from "@/services/insights.service";
import type { AnalyticsRange, OfferInput, PartnerOffer } from "@/types/insights";
import { queryKeys } from "./keys";

const useVendorId = () => useAuthStore((s) => s.partner?._id ?? "");

/** Daily sales, top dishes and cancellations for the chosen period. */
export function useSalesAnalytics(days: AnalyticsRange) {
  const vendorId = useVendorId();
  return useQuery({ queryKey: queryKeys.analytics(vendorId, days), queryFn: () => getSalesAnalytics(days), enabled: !!vendorId });
}

export function useMyOffers() {
  const vendorId = useVendorId();
  return useQuery({ queryKey: queryKeys.offers(vendorId), queryFn: getMyOffers, enabled: !!vendorId });
}

export function useCreateOffer() {
  const vendorId = useVendorId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: OfferInput) => createOffer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.offers(vendorId) }),
  });
}

/** Switches an offer at once; a failure puts it back. */
export function useSetOfferActive() {
  const vendorId = useVendorId();
  const queryClient = useQueryClient();
  const key = queryKeys.offers(vendorId);
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => setOfferActive(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PartnerOffer[]>(key);
      queryClient.setQueryData<PartnerOffer[]>(key, (offers) => offers?.map((o) => (o._id === id ? { ...o, isActive } : o)));
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteOffer() {
  const vendorId = useVendorId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOffer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.offers(vendorId) }),
  });
}
