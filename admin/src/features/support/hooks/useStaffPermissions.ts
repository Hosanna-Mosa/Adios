import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import type { SupportPermission } from "../supportExtras";

/**
 * What the signed-in admin / support member may do (GET /admin/me/permissions). The server enforces
 * it; this only hides controls that would be refused. While it loads, nothing is offered.
 */
export function useStaffPermissions() {
  const { data } = useQuery({
    queryKey: ["admin", "me", "permissions"],
    queryFn: () => adminFetch<{ role: string; permissions: SupportPermission[] }>("/admin/me/permissions"),
    staleTime: 60_000,
  });
  const permissions = data?.permissions ?? [];
  return { permissions, can: (permission: SupportPermission) => permissions.includes(permission) };
}
