import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { adminFetch } from "@/lib/api-client";
import {
  HELPER_RATE_DEFAULTS,
  HELPER_RATE_LIMITS,
  type HelperRateKey,
  type HelperRates,
  type HelperRatesForm,
  type SystemConfigResponse,
} from "../helperPricingTypes";

const CONFIG_QUERY_KEY = ["admin", "config"];
const RATE_KEYS = Object.keys(HELPER_RATE_LIMITS) as HelperRateKey[];

const toForm = (rates: HelperRates): HelperRatesForm =>
  Object.fromEntries(RATE_KEYS.map((key) => [key, String(rates[key])])) as HelperRatesForm;

/** All state/query/mutation logic for HelperPricing.tsx. */
export function useHelperPricing() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HelperRatesForm>(() => toForm(HELPER_RATE_DEFAULTS));

  const { data, isLoading, isError } = useQuery<SystemConfigResponse>({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: () => adminFetch<SystemConfigResponse>("/admin/config"),
  });
  const saved = data?.helperRates;

  useEffect(() => {
    if (saved) setForm(toForm(saved));
  }, [saved]);

  // One message per invalid field, matching the backend's ranges.
  const errors = useMemo(() => {
    const result: Partial<Record<HelperRateKey, string>> = {};
    for (const key of RATE_KEYS) {
      const { min, max, integer } = HELPER_RATE_LIMITS[key];
      const raw = form[key].trim();
      const value = Number(raw);
      if (raw === "" || !Number.isFinite(value)) {
        result[key] = t("helperPricing.errors.required");
      } else if (integer && !Number.isInteger(value)) {
        result[key] = t("helperPricing.errors.wholeNumber");
      } else if (value < min || value > max) {
        result[key] = t("helperPricing.errors.range", { min, max });
      }
    }
    if (!result.minHours && !result.maxHours && Number(form.maxHours) < Number(form.minHours)) {
      result.maxHours = t("helperPricing.errors.maxHoursBelowMin");
    }
    return result;
  }, [form, t]);

  const isValid = Object.keys(errors).length === 0;

  // Parsed values for the live preview; null while any field is invalid.
  const rates = useMemo<HelperRates | null>(
    () => (isValid ? (Object.fromEntries(RATE_KEYS.map((key) => [key, Number(form[key])])) as unknown as HelperRates) : null),
    [form, isValid],
  );

  const isDirty = saved ? RATE_KEYS.some((key) => Number(form[key]) !== saved[key] || form[key].trim() === "") : false;

  const updateMutation = useMutation({
    mutationFn: (helperRates: HelperRates) =>
      adminFetch<{ message: string }>("/admin/config", {
        method: "PUT",
        body: JSON.stringify({ helperRates }),
      }),
    onSuccess: () => {
      toast.success(t("helperPricing.saved"));
      queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
    },
    onError: (err: Error) => {
      toast.error(err.message || t("helperPricing.saveFailed"));
    },
  });

  const setField = (key: HelperRateKey, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!rates) {
      toast.error(t("helperPricing.fixErrors"));
      return;
    }
    updateMutation.mutate(rates);
  };

  const handleReset = () => {
    if (saved) setForm(toForm(saved));
  };

  return {
    form,
    setField,
    errors,
    rates,
    isLoading,
    isError,
    isDirty,
    handleSave,
    handleReset,
    isSaving: updateMutation.isPending,
  };
}
