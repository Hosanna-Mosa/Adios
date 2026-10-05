import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { VerificationKind, VerificationQueueResponse } from "../types";

export type ReviewAction =
  | { type: "approve" }
  | { type: "reject"; reason?: string }
  | { type: "request-documents"; documents: string[]; note?: string };

/**
 * One verification queue (drivers or restaurants): the list for the selected
 * status tab, per-status counts, and the approve / reject / request-documents
 * actions. Shares the ["verifications", kind, …] query keys with the sidebar badge.
 */
export function useVerificationQueue<T>(kind: VerificationKind, defaultStatus: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(defaultStatus);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["verifications", kind, status],
    queryFn: () => adminFetch<VerificationQueueResponse>(`/admin/verifications/${kind}?status=${encodeURIComponent(status)}`),
  });

  const review = useMutation({
    mutationFn: ({ id, action }: { id: string; action: ReviewAction }) => {
      const { type, ...body } = action;
      return adminFetch<{ message: string }>(`/admin/verifications/${kind}/${id}/${type}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["verifications", kind] });
      // The Drivers / Vendors pages show onboarding status too.
      queryClient.invalidateQueries({ queryKey: [kind] });
      toast.success(result.message);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("verification.actionFailed", "Could not update the application"));
    },
  });

  return {
    status,
    setStatus,
    items: ((kind === "drivers" ? data?.drivers : data?.vendors) || []) as T[],
    counts: data?.counts || {},
    isLoading,
    isError,
    error: error as Error | null,
    review,
  };
}
