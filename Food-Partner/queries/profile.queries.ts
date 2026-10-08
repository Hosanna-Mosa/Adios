import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/contexts/authStore";
import { getMyProfile, updateMyProfile } from "@/services/auth.service";
import { setOutletOpen } from "@/services/outlet.service";
import type { PartnerProfile, ProfileUpdate } from "@/types/models";
import { queryKeys } from "./keys";

/**
 * The outlet's own record, fresh from the database — name, contact, address,
 * photo, rating and whether it's open right now. Shared by the dashboard
 * header and the Account tab. Until it arrives, the details saved at sign-in
 * stand in, and once it does they're updated so an admin's edit to the outlet
 * shows up without signing out. It refreshes every minute while the app is in
 * the foreground, because the open state follows the clock (opening hours).
 */
export function usePartnerProfile() {
  const partner = useAuthStore((s) => s.partner);
  const updatePartner = useAuthStore((s) => s.updatePartner);
  const query = useQuery({
    queryKey: queryKeys.profile(partner?._id ?? ""),
    queryFn: getMyProfile,
    enabled: !!partner,
    placeholderData: partner ? (partner as PartnerProfile) : undefined,
    refetchInterval: 60_000,
  });

  const fresh = query.isPlaceholderData ? undefined : query.data;
  useEffect(() => {
    if (fresh) updatePartner({ name: fresh.name, email: fresh.email, phone: fresh.phone });
  }, [fresh, updatePartner]);

  return { profile: query.data ?? (partner as PartnerProfile | null), loaded: !!fresh, failed: query.isError, refetch: query.refetch };
}

/**
 * The "Accepting orders" switch. It flips at once; the server's answer — the
 * fresh profile with the open state the hours now give — then replaces it, and
 * a failure puts the switch back.
 */
export function useSetOutletOpen() {
  const partner = useAuthStore((s) => s.partner);
  const queryClient = useQueryClient();
  const key = queryKeys.profile(partner?._id ?? "");
  return useMutation({
    mutationFn: setOutletOpen,
    onMutate: async (isOpen: boolean) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<PartnerProfile>(key);
      // Pausing closes the outlet whatever the hours say. Resuming depends on
      // the hours, which only the server knows — so its answer is awaited.
      if (previous) {
        queryClient.setQueryData<PartnerProfile>(key, {
          ...previous,
          isManuallyClosed: !isOpen,
          openState: isOpen ? previous.openState : { isOpen: false, label: "Closed", today: previous.openState?.today ?? null },
          openStatePending: isOpen,
        });
      }
      return { previous };
    },
    onError: (_error, _isOpen, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSuccess: (profile) => queryClient.setQueryData(key, profile),
  });
}

/**
 * Saves the Edit restaurant details screen. The answer is the fresh profile:
 * it replaces the cache, and the name and contact details saved at sign-in
 * follow it, as usePartnerProfile does.
 */
export function useUpdateProfile() {
  const partner = useAuthStore((s) => s.partner);
  const updatePartner = useAuthStore((s) => s.updatePartner);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: ProfileUpdate) => updateMyProfile(update),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile(partner?._id ?? ""), profile);
      updatePartner({ name: profile.name, email: profile.email, phone: profile.phone });
    },
  });
}

/** "4.3" for a rated outlet, null for one with no ratings yet. */
export const ratingOf = (profile: PartnerProfile | null | undefined) =>
  profile?.rating && profile.rating > 0 ? profile.rating.toFixed(1) : null;

export const reviewCountOf = (profile: PartnerProfile | null | undefined) => Number(profile?.reviews) || 0;
