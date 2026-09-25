import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface AppVersionConfig {
  _id?: string;
  platform: "ios" | "android";
  latest: string;
  minRequired: string;
  storeUrl: string;
}

interface AppVersionUpdateResponse {
  data?: AppVersionConfig;
}

/** All state/query/mutation logic for AppVersions.tsx (work queue item #18). */
export function useAppVersions() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Platform configuration state
  const [ios, setIos] = useState<AppVersionConfig>({ platform: "ios", latest: "1.0.0", minRequired: "1.0.0", storeUrl: "" });
  const [android, setAndroid] = useState<AppVersionConfig>({ platform: "android", latest: "1.0.0", minRequired: "1.0.0", storeUrl: "" });

  const { data: configs = [], isLoading } = useQuery<AppVersionConfig[]>({
    queryKey: ["admin-app-versions"],
    queryFn: () => adminFetch<AppVersionConfig[]>("/admin/app-versions"),
  });

  useEffect(() => {
    if (configs && configs.length > 0) {
      const iosConfig = configs.find(c => c.platform === "ios");
      const androidConfig = configs.find(c => c.platform === "android");
      if (iosConfig) setIos(iosConfig);
      if (androidConfig) setAndroid(androidConfig);
    }
  }, [configs]);

  const updateMutation = useMutation({
    mutationFn: (data: AppVersionConfig) =>
      adminFetch<AppVersionUpdateResponse>("/admin/app-versions", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (res) => {
      toast.success(t("system.platformVersionConfigsUpdated", { platform: res.data?.platform?.toUpperCase(), defaultValue: "{{platform}} version configurations updated successfully!" }));
      queryClient.invalidateQueries({ queryKey: ["admin-app-versions"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("system.failedToUpdateVersionSettings"));
    },
  });

  const handleSave = (platform: "ios" | "android") => {
    const data = platform === "ios" ? ios : android;
    if (!data.latest || !data.minRequired || !data.storeUrl) {
      toast.error(t("system.pleaseFillAllFieldsBeforeSaving"));
      return;
    }
    updateMutation.mutate(data);
  };

  return {
    ios,
    setIos,
    android,
    setAndroid,
    isLoading,
    handleSave,
    isSaving: updateMutation.isPending,
  };
}
