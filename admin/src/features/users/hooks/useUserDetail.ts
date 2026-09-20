import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import type { OrderChatMessage, UserDetailResponse, UserProfileForm } from "../userDetailTypes";

const EMPTY_FORM: UserProfileForm = { name: "", email: "", phone: "", role: "USER" };

/** All state/query/mutation logic for UserDetail.tsx (work queue item #11). */
export function useUserDetail(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<UserProfileForm>(EMPTY_FORM);
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

  useEffect(() => {
    if (data?.user) {
      setForm({
        name: data.user.name,
        email: data.user.email || "",
        phone: data.user.phone,
        role: data.user.role,
      });
    }
  }, [data]);

  const updateProfileMutation = useMutation({
    mutationFn: (updateData: UserProfileForm) =>
      adminFetch(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      }),
    onSuccess: () => {
      toast.success("User profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: (isBlocked: boolean) =>
      adminFetch<{ user: { isBlocked: boolean } }>(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isBlocked }),
      }),
    onSuccess: (res) => {
      const statusText = res.user.isBlocked ? "blocked" : "unblocked";
      toast.success(`User has been ${statusText}`);
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update block status");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => adminFetch(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("User account deleted successfully");
      navigate("/users");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(form);
  };

  const handleDeleteClick = () => {
    if (confirm("WARNING: This will permanently delete this user and their associated records. Are you sure?")) {
      deleteUserMutation.mutate();
    }
  };

  return {
    data,
    isLoading,
    error,
    form,
    setForm,
    handleProfileSubmit,
    isSavingProfile: updateProfileMutation.isPending,
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
