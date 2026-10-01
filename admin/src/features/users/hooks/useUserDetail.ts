import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import type { OrderChatMessage, UserDetailResponse } from "../userDetailTypes";

/** All state/query/mutation logic for UserDetail.tsx (work queue item #11). */
export function useUserDetail(id: string | undefined) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedOrderChat, setSelectedOrderChat] = useState<string | null>(null);

  const { data: chatMessages = [], isLoading: isChatLoading } = useQuery<OrderChatMessage[]>({
    queryKey: ["order-chat", selectedOrderChat],
    queryFn: () => adminFetch<OrderChatMessage[]>(`/admin/orders/${selectedOrderChat}/chat`),
    enabled: !!selectedOrderChat,
  });

  const { data, isLoading, error } = useQuery<UserDetailResponse>({
    queryKey: ["admin-user-detail", id],
    queryFn: () => adminFetch<UserDetailResponse>(`/admin/users/${id}`),
    enabled: !!id,
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (isBlocked: boolean) =>
      adminFetch<{ user: { isBlocked: boolean } }>(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isBlocked }),
      }),
    onSuccess: (res) => {
      const statusText = res.user.isBlocked ? t("users.blockedLower") : t("users.unblockedLower");
      toast.success(t("users.userHasBeenStatus", { status: statusText, defaultValue: "User has been {{status}}" }));
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("users.failedToUpdateBlockStatus"));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => adminFetch(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("users.userAccountDeletedSuccessfully"));
      navigate("/users");
    },
    onError: (err: Error) => {
      toast.error(err.message || t("users.failedToDeleteUser"));
    },
  });

  const handleDeleteClick = () => {
    if (confirm(t("users.confirmPermanentlyDeleteUser"))) {
      deleteUserMutation.mutate();
    }
  };

  return {
    data,
    isLoading,
    error,
    toggleBlock: () => data && toggleBlockMutation.mutate(!data.user.isBlocked),
    isTogglingBlock: toggleBlockMutation.isPending,
    handleDeleteClick,
    selectedOrderChat,
    setSelectedOrderChat,
    chatMessages,
    isChatLoading,
    navigateToUsers: () => navigate("/users"),
  };
}
