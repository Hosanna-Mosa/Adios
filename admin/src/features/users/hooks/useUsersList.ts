import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import { useListQuery } from "@/hooks/useListQuery";
import type { AdminUser } from "../types";

const getRoleFilterOptions = (t: (key: string) => string) => [
  { value: "ALL", label: t("users.allUsers") },
  { value: "USER", label: t("users.customersFilterLabel") },
  { value: "DRIVER", label: t("sidebar.drivers") },
  { value: "ADMIN", label: t("users.admins") },
  { value: "BLOCKED", label: t("users.blockedOnly") },
];

const EMPTY_NEW_USER = { name: "", email: "", phone: "", password: "", role: "USER" };

/**
 * All list-page state/query/mutation logic for Users.tsx — the Phase 2
 * pilot's feature hook. Moved out of the page as-is; nothing here changes
 * behavior from the original inline implementation.
 */
export function useUsersList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilterState] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);

  const {
    items: users,
    isLoading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    searchedItems,
    paginate,
  } = useListQuery<AdminUser>({
    queryKey: ["admin", "users"],
    queryFn: () => adminFetch<AdminUser[]>("/admin/users"),
    itemsPerPage: 5,
    searchFields: (u) => [u.name, u.email, u.phone],
  });

  const setRoleFilter = (value: string) => {
    setRoleFilterState(value);
    setCurrentPage(1);
  };

  const createUserMutation = useMutation({
    mutationFn: (data: typeof newUser) =>
      adminFetch("/admin/users", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(t("users.userCreatedSuccessfully"));
      setIsAddOpen(false);
      setNewUser(EMPTY_NEW_USER);
    },
    onError: (err: Error) => {
      toast.error(err.message || t("users.failedToCreateUser"));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(t("users.userDeletedSuccessfully"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("users.failedToDeleteUser"));
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      adminFetch(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify({ isBlocked }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(t("users.userBlockStatusUpdated"));
    },
    onError: (err: Error) => {
      toast.error(err.message || t("users.failedToChangeUserStatus"));
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.phone) {
      toast.error(t("users.nameAndPhoneRequired"));
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleDeleteClick = (user: AdminUser) => {
    if (confirm(t("users.confirmDeleteUser", { name: user.name, defaultValue: "Are you sure you want to delete user {{name}}?" }))) {
      deleteUserMutation.mutate(user._id);
    }
  };

  const handleBanClick = (user: AdminUser) => {
    toggleBanMutation.mutate({ id: user._id, isBlocked: !user.isBlocked });
  };

  // Kept from the pre-refactor page: unused today (the table's Eye action
  // navigates via <Link> instead), but removing it would be a behavior
  // change this refactor isn't meant to make.
  const handleViewClick = (user: AdminUser) => {
    setViewingUser(user);
    setIsViewOpen(true);
  };
  void handleViewClick;

  const activeUsersCount = users.filter((u) => u.role === "USER").length;
  const driverCount = users.filter((u) => u.role === "DRIVER").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const filteredUsers = searchedItems.filter((u) => {
    if (roleFilter === "ALL") return true;
    if (roleFilter === "USER") return u.role === "USER";
    if (roleFilter === "DRIVER") return u.role === "DRIVER";
    if (roleFilter === "ADMIN") return u.role === "ADMIN";
    if (roleFilter === "BLOCKED") return u.isBlocked === true;
    return true;
  });

  const { pageItems: paginatedUsers, totalPages, safePage } = paginate(filteredUsers);

  return {
    users,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    roleFilterOptions: getRoleFilterOptions(t),
    currentPage: safePage,
    setCurrentPage,
    totalPages,
    paginatedUsers,
    filteredUsers,
    activeUsersCount,
    driverCount,
    adminCount,
    isAddOpen,
    setIsAddOpen,
    newUser,
    setNewUser,
    handleCreateSubmit,
    isCreating: createUserMutation.isPending,
    isViewOpen,
    setIsViewOpen,
    viewingUser,
    handleDeleteClick,
    handleBanClick,
  };
}
