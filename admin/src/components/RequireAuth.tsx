import { Navigate } from "react-router-dom";
import { getStaffRole, SUPPORT_HOME } from "@/lib/session";

// Pages both admin and support staff may open (the support desk) — see
// RootRedirect in AnimatedRoutes.tsx. Deliberately does NOT accept vendor_token:
// vendor sessions have their own page tree under RequireVendor, and letting a
// vendor token render this shell (even though the backend still 401s the data
// calls) leaked page structure to a lower-privileged session.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!getStaffRole()) {
    return <Navigate to="/vendor-login" replace />;
  }

  return <>{children}</>;
}

// Everything outside the support desk. A support session is sent back to its
// cases instead. This only hides the UI — the backend's authorizeRole([ADMIN])
// is what actually refuses the data.
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const role = getStaffRole();

  if (!role) {
    return <Navigate to="/vendor-login" replace />;
  }
  if (role !== "admin") {
    return <Navigate to={SUPPORT_HOME} replace />;
  }

  return <>{children}</>;
}

// Vendor-only pages (/vendor/*) additionally require vendor_token
// specifically, since admin/support tokens aren't valid there.
export function RequireVendor({ children }: { children: React.ReactNode }) {
  const hasVendorToken = !!localStorage.getItem("vendor_token");

  if (!hasVendorToken) {
    return <Navigate to="/vendor-login" replace />;
  }

  return <>{children}</>;
}
