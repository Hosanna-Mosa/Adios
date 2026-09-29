import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { getStaffRole } from "@/lib/session";
import type { NewSupportMemberForm, SupportMember } from "../types";

const MEMBERS_KEY = ["admin", "support-members"];

/** Support team accounts. Admin-only: the query stays off for a support session. */
export function useSupportMembers() {
  const queryClient = useQueryClient();
  const isAdmin = getStaffRole() === "admin";

  const membersQuery = useQuery({
    queryKey: MEMBERS_KEY,
    queryFn: () => adminFetch<SupportMember[]>("/admin/support-members"),
    enabled: isAdmin,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: MEMBERS_KEY });

  const createMember = useMutation({
    mutationFn: (form: NewSupportMemberForm) =>
      adminFetch<SupportMember>("/admin/support-members", {
        method: "POST",
        body: JSON.stringify(form),
      }),
    onSuccess: invalidate,
  });

  const resetPassword = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminFetch(`/admin/support-members/${id}/password`, {
        method: "PUT",
        body: JSON.stringify({ password }),
      }),
  });

  const removeMember = useMutation({
    mutationFn: (id: string) => adminFetch(`/admin/support-members/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  return {
    isAdmin,
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    createMember,
    resetPassword,
    removeMember,
  };
}

const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";

/** A random 12-character password for the admin to hand to a new member. */
export function generatePassword(length = 12) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length]).join("");
}
