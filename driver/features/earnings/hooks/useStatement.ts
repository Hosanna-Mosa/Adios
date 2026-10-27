import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import * as Print from "expo-print";

import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";
import type { StatementResult } from "../types";
import { hasSaveFolder, savePdf, shareFile } from "../utils/savePdf";
import {
  fromYmd,
  isOverOneYear,
  toYmd,
  validateStatementDates,
  type StatementBounds,
} from "../utils/statementDates";

/** Day shown in the picker fields and messages, e.g. "17 Oct 2026". */
export function formatDay(date: Date, locale?: string) {
  return date.toLocaleDateString(locale || "en", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Pick a period, check it, and get the statement: shown on screen up to a year (with a PDF to
 * download), emailed by the server beyond that.
 */
export function useStatement() {
  const { t, i18n } = useTranslation();
  const [bounds, setBounds] = useState<StatementBounds | null>(null);
  const [boundsError, setBoundsError] = useState(false);
  const [from, setFromState] = useState<Date | null>(null);
  const [to, setToState] = useState<Date | null>(null);
  const [result, setResult] = useState<StatementResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMakingPdf, setIsMakingPdf] = useState(false);
  // Errors only show after the driver has tried once, so an empty form isn't red on arrival.
  const [submitted, setSubmitted] = useState(false);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${useDriverStore.getState().token}`,
  });

  const loadBounds = useCallback(async () => {
    if (!API_URL || !useDriverStore.getState().token) return;
    try {
      const res = await fetch(`${API_URL}/drivers/earnings-statement/bounds`, { headers: authHeaders() });
      const body = await res.json();
      if (!res.ok || !body?.minDate || !body?.maxDate) throw new Error(body?.message);
      setBounds({ minDate: body.minDate, maxDate: body.maxDate });
      setBoundsError(false);
    } catch {
      setBoundsError(true);
    }
  }, []);

  useEffect(() => {
    loadBounds();
  }, [loadBounds]);

  // Changing a date throws away the statement on screen: it no longer matches the fields.
  const setFrom = (date: Date | null) => {
    setFromState(date);
    setResult(null);
  };
  const setTo = (date: Date | null) => {
    setToState(date);
    setResult(null);
  };

  const dateError = useMemo(() => {
    if (!bounds) return null;
    const error = validateStatementDates(from, to, bounds, (ymd) => formatDay(fromYmd(ymd), i18n.language));
    if (!error) return null;
    return t(`earnings.statementErr.${error.key}`, {
      defaultValue: error.fallback,
      ...("params" in error ? error.params : {}),
    });
  }, [from, to, bounds, i18n.language, t]);

  const willEmail = !!from && !!to && !dateError && isOverOneYear(from, to);

  const generate = async () => {
    setSubmitted(true);
    if (!bounds || dateError || !from || !to) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/drivers/earnings-statement`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ from: toYmd(from), to: toYmd(to) }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message);

      if (body.delivery === "email") {
        setResult(null);
        Alert.alert(
          t("earnings.statementEmailTitle", { defaultValue: "We'll email it to you" }),
          t("earnings.statementEmailBody", {
            defaultValue: "A statement longer than a year is too long to read here. We're sending it to {{email}}.",
            email: body.email,
          }),
        );
        return;
      }
      setResult(body as StatementResult);
    } catch (error: any) {
      Alert.alert(
        t("earnings.statementUnavailable"),
        error?.message || t("earnings.statementTryAgain"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  /** First time on Android: say what the folder picker is for before it appears. */
  const explainFolderPick = () =>
    new Promise<boolean>((resolve) => {
      Alert.alert(
        t("earnings.statementPickFolderTitle", { defaultValue: "Choose where to save" }),
        t("earnings.statementPickFolderBody", {
          defaultValue: "Pick a folder (like Documents) and tap \"Use this folder\". We'll save your statements there from now on.",
        }),
        [
          { text: t("actions.cancel"), style: "cancel", onPress: () => resolve(false) },
          { text: t("actions.continue"), onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });

  const downloadPdf = async () => {
    if (!result) return;
    if (!(await hasSaveFolder()) && !(await explainFolderPick())) return;

    setIsMakingPdf(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: result.html });
      const shareTitle = t("earnings.statementSaveTitle", { defaultValue: "Save your statement" });
      const outcome = await savePdf(uri, `earnings-statement-${result.from}-to-${result.to}`, shareTitle);
      if (outcome.kind === "saved") {
        Alert.alert(
          t("earnings.statementSavedTitle", { defaultValue: "Statement saved" }),
          t("earnings.statementSavedBody", { defaultValue: "Your PDF was saved to the folder you chose." }),
          [
            { text: t("actions.ok") },
            {
              text: t("earnings.statementShare", { defaultValue: "Share" }),
              onPress: () => shareFile(uri, shareTitle).catch(() => {}),
            },
          ],
        );
      }
    } catch {
      Alert.alert(t("earnings.statementUnavailable"), t("earnings.statementPdfFailed", { defaultValue: "We couldn't make the PDF. Please try again." }));
    } finally {
      setIsMakingPdf(false);
    }
  };

  return {
    bounds, boundsError, loadBounds,
    from, to, setFrom, setTo,
    error: submitted ? dateError : null,
    willEmail,
    result, isLoading, isMakingPdf,
    generate, downloadPdf,
  };
}
