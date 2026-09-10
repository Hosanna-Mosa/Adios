import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";

/** All state/submit logic for VendorSettings.tsx (work queue item #18). */
export function useVendorPasswordChange() {
  const navigate = useNavigate();
  const vendorData = JSON.parse(localStorage.getItem("vendor_data") || "{}");
  const isMeatVendor = vendorData.role === "meat_vendor";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isMeatVendor ? "/meat/change-password" : "/vendors/change-password";

      await adminFetch(endpoint, {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      toast.success("Password changed successfully");

      // Sign out after password change — force re-login with new password
      localStorage.removeItem("vendor_token");
      localStorage.removeItem("vendor_data");
      navigate("/vendor-login");
    } catch (error) {
      toast.error((error as Error).message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isMeatVendor,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    handleChangePassword,
  };
}
