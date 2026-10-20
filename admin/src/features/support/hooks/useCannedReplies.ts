import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import type { CannedReply } from "../supportExtras";

const KEY = ["admin", "canned-replies"];

/** The shared library of canned replies, with create / edit / delete for those who may manage it. */
export function useCannedReplies() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: KEY, queryFn: () => adminFetch<CannedReply[]>("/admin/canned-replies") });
  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (reply: Omit<CannedReply, "_id">) => adminFetch<CannedReply>("/admin/canned-replies", { method: "POST", body: JSON.stringify(reply) }),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ _id, ...reply }: CannedReply) => adminFetch<CannedReply>(`/admin/canned-replies/${_id}`, { method: "PUT", body: JSON.stringify(reply) }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/canned-replies/${id}`, { method: "DELETE" }),
    onSuccess: refresh,
  });

  return { replies: data, isLoading, create, update, remove };
}
