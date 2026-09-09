import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminFetch } from "@/lib/api-client";
import { useListQuery } from "@/hooks/useListQuery";
import type { AdminUser } from "../types";

const ROLE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Users" },
  { value: "USER", label: "Customers (USER)" },
  { value: "DRIVER", label: "Drivers" },
  { value: "ADMIN", label: "Admins" },
  { value: "BLOCKED", label: "Blocked Only" },
];

const EMPTY_NEW_USER = { name: "", email: "", phone: "", password: "", role: "USER" };

/**
 * All list-page state/query/mutation logic for Users.tsx — the Phase 2
 * pilot's feature hook. Moved out of the page as-is; nothing here changes
 * behavior from the original inline implementation.
 */
export function useUsersList() {
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
      toast.success("User created successfully");
      setIsAddOpen(false);
      setNewUser(EMPTY_NEW_USER);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create user");
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete user");
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      adminFetch(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify({ isBlocked }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User block status updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to change user status");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.phone) {
      toast.error("Name and phone are required");
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleDeleteClick = (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
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
    roleFilterOptions: ROLE_FILTER_OPTIONS,
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
