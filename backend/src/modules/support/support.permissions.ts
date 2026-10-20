import { NextFunction, Response } from "express";
import User, { UserRole } from "../../database/models/User";
import type { AuthRequest } from "../../middleware/auth.middleware";

// Support staff share one SUPPORT role; what each member may do is a list of permissions an admin
// sets on their account. Admins can do everything. A member with no list saved (everyone who
// existed before permissions) keeps exactly what support could always do, with the newer
// sensitive abilities (export, canned-reply management) switched off until an admin grants them.

export const SUPPORT_PERMISSIONS = [
  "reply", // answer customers
  "resolve", // request resolution / reopen a case
  "priority", // change a ticket's priority
  "notes", // write internal notes
  "cancel_orders", // cancel an order for a customer
  "export", // download the ticket export
  "manage_canned", // create, edit and delete canned replies
] as const;
export type SupportPermission = (typeof SUPPORT_PERMISSIONS)[number];

export const DEFAULT_SUPPORT_PERMISSIONS: SupportPermission[] = ["reply", "resolve", "priority", "notes", "cancel_orders"];

/** Keeps only known permissions, once each. */
export const cleanPermissions = (input: unknown): SupportPermission[] =>
  Array.from(new Set((Array.isArray(input) ? input : []).filter((p): p is SupportPermission => (SUPPORT_PERMISSIONS as readonly string[]).includes(p))));

export const effectivePermissions = (role: string | undefined, saved?: string[] | null): SupportPermission[] => {
  if (role === UserRole.ADMIN) return [...SUPPORT_PERMISSIONS];
  if (role !== UserRole.SUPPORT) return [];
  return Array.isArray(saved) ? cleanPermissions(saved) : [...DEFAULT_SUPPORT_PERMISSIONS];
};

/** The signed-in staff member's permissions, read fresh so an admin's change applies at once. */
export async function permissionsOf(req: AuthRequest): Promise<SupportPermission[]> {
  const role = req.user?.role;
  if (role === UserRole.ADMIN) return [...SUPPORT_PERMISSIONS];
  if (role !== UserRole.SUPPORT || !req.user?.userId) return [];
  const user = await User.findById(req.user.userId).select("supportPermissions").lean<{ supportPermissions?: string[] }>();
  return effectivePermissions(role, user?.supportPermissions);
}

export const hasPermission = async (req: AuthRequest, permission: SupportPermission) => (await permissionsOf(req)).includes(permission);

/** Route guard: admins pass; a support member needs the permission. */
export const requireSupportPermission = (permission: SupportPermission) => async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (await hasPermission(req, permission)) return next();
    return res.status(403).json({ message: "Your support account does not have permission to do this. Ask an admin." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
