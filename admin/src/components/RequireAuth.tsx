import { Navigate } from "react-router-dom";

// Admin/support-only pages — see RootRedirect in App.tsx. Deliberately does NOT
// accept vendor_token: vendor sessions have their own page tree under RequireVendor,
// and letting a vendor token render this shell (even though the backend still 401s
// the data calls) leaked page structure to a lower-privileged session.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const hasToken =
    !!localStorage.getItem("admin_token") ||
    !!localStorage.getItem("support_token");

  if (!hasToken) {
    return <Navigate to="/vendor-login" replace />;
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
