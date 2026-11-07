import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";

export type Audience = "users" | "drivers" | "partners" | "everyone";

export interface Broadcast {
  _id: string;
  audience: Audience;
  title: string;
  body: string;
  screen?: string;
  sentByName?: string;
  recipients: number;
  createdAt: string;
}

/** Push announcements (POST /admin/broadcasts) and the history of what was sent. */
export function useBroadcasts() {
  const queryClient = useQueryClient();
  const history = useQuery({ queryKey: ["admin", "broadcasts"], queryFn: () => adminFetch<Broadcast[]>("/admin/broadcasts") });
  const send = useMutation({
    mutationFn: (payload: { audience: Audience; title: string; body: string; screen?: string }) =>
      adminFetch<Broadcast>("/admin/broadcasts", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "broadcasts"] }),
  });
  return { history: history.data ?? [], isLoading: history.isLoading, send };
}
