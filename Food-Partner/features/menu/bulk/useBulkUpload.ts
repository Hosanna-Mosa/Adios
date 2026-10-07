import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { useBulkAddFoodItems } from "@/queries/menu.queries";
import type { BulkUploadResult } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { createBulkStyles } from "./bulk.styles";
import { EMPTY_DRAFT, parseSheet, rowFromDraft, toBulkItem, toDraft, type ParsedRow, type RowDraft, type RowError } from "./parseRows";
import { pickSheet, shareTemplate } from "./sheetFiles";

/** A failed row from the server, traced back to its row in the sheet. */
export interface FailedRow {
  sheetRow: number;
  name: string;
  error: string;
}

/** The row editor: a sheet row being changed, or a new dish being added. */
export type RowEditor = { sheetRow: number | null; draft: RowDraft };

/**
 * Bulk menu upload: 1. download the template, 2. pick the filled sheet, check
 * every row here (the same rules the server applies) and preview it, 3. send
 * the valid rows to POST /food/bulk and show what was added and what failed.
 * Between 2 and 3 the owner can edit, remove or add rows; the rows themselves
 * stay hidden behind "View items" so a long sheet doesn't bury the screen.
 */
export function useBulkUpload() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createBulkStyles(tokens), [tokens]);
  const toast = useToast();
  const upload = useBulkAddFoodItems();
  const [sharing, setSharing] = useState(false);
  const [reading, setReading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [sheetError, setSheetError] = useState<RowError | null>(null);
  const [result, setResult] = useState<{ created: number; failed: FailedRow[] } | null>(null);
  const [showItems, setShowItems] = useState(false);
  const [editor, setEditor] = useState<RowEditor | null>(null);

  const valid = useMemo(() => rows.filter((r) => !r.errors.length), [rows]);
  const invalidCount = rows.length - valid.length;

  const downloadTemplate = async () => {
    setSharing(true);
    try {
      await shareTemplate(t("bulkUpload.templateShareTitle"));
    } catch {
      // File-system and share-sheet errors are native messages, not sentences for the owner.
      toast.show(t("bulkUpload.templateFailed"), "error");
    } finally {
      setSharing(false);
    }
  };

  const chooseFile = async () => {
    setReading(true);
    try {
      const sheet = await pickSheet();
      if (!sheet) return;
      const outcome = parseSheet(sheet.matrix);
      setFileName(sheet.name);
      setResult(null);
      setRows(outcome.ok ? outcome.rows : []);
      setSheetError(outcome.ok ? null : outcome.error);
      setShowItems(false);
    } catch {
      setSheetError({ key: "bulkUpload.errors.unreadable" });
      setRows([]);
    } finally {
      setReading(false);
    }
  };

  const send = () => {
    if (!valid.length) return;
    upload.mutate(valid.map(toBulkItem), {
      onSuccess: (res: BulkUploadResult) => {
        const failed = (res.failed ?? []).map((f) => {
          const row = valid[f.row - 1];
          return { sheetRow: row?.sheetRow ?? f.row, name: row?.name ?? "", error: f.error };
        });
        setResult({ created: res.created ?? 0, failed });
        setRows([]);
        if (res.created) toast.show(t("bulkUpload.addedToast", { count: res.created }), "success");
      },
      onError: (error) => toast.show(errorMessage(error, t("bulkUpload.uploadFailed")), "error"),
    });
  };

  const reset = () => {
    setRows([]);
    setFileName(null);
    setSheetError(null);
    setResult(null);
    setShowItems(false);
    setEditor(null);
  };

  const removeFile = () =>
    showAlert(
      t("bulkUpload.removeFileTitle"),
      t("bulkUpload.removeFileMessage", { name: fileName ?? "" }),
      [
        { text: t("actions.cancel"), style: "cancel" },
        { text: t("bulkUpload.remove"), style: "destructive", onPress: reset },
      ],
      "warning",
    );

  const removeRow = (row: ParsedRow) =>
    showAlert(
      t("bulkUpload.removeRowTitle"),
      t("bulkUpload.removeRowMessage", { name: row.name || t("bulkUpload.rowNumber", { row: row.sheetRow }) }),
      [
        { text: t("actions.cancel"), style: "cancel" },
        { text: t("bulkUpload.remove"), style: "destructive", onPress: () => setRows((prev) => prev.filter((r) => r.sheetRow !== row.sheetRow)) },
      ],
      "warning",
    );

  const removeInvalid = () =>
    showAlert(
      t("bulkUpload.removeInvalidTitle"),
      t("bulkUpload.removeInvalidMessage", { n: invalidCount }),
      [
        { text: t("actions.cancel"), style: "cancel" },
        { text: t("bulkUpload.remove"), style: "destructive", onPress: () => setRows((prev) => prev.filter((r) => !r.errors.length)) },
      ],
      "warning",
    );

  const editRow = (row: ParsedRow) => setEditor({ sheetRow: row.sheetRow, draft: toDraft(row) });
  const addRow = () => setEditor({ sheetRow: null, draft: EMPTY_DRAFT });
  const closeEditor = () => setEditor(null);

  /** Saves the editor: replaces the row in place, or appends a new one numbered after the last row. */
  const saveRow = (draft: RowDraft) => {
    if (!editor) return;
    if (editor.sheetRow === null) {
      setRows((prev) => {
        const next = prev.reduce((max, r) => Math.max(max, r.sheetRow), 1) + 1;
        return [...prev, { ...rowFromDraft(draft, next), isNew: true }];
      });
      setShowItems(true);
    } else {
      const sheetRow = editor.sheetRow;
      setRows((prev) => prev.map((r) => (r.sheetRow === sheetRow ? { ...rowFromDraft(draft, sheetRow), isNew: r.isNew, edited: !r.isNew } : r)));
    }
    setEditor(null);
  };

  return {
    insets,
    tokens,
    styles,
    sharing,
    downloadTemplate,
    reading,
    chooseFile,
    fileName,
    rows,
    sheetError,
    validCount: valid.length,
    invalidCount,
    uploading: upload.isPending,
    send,
    result,
    reset,
    removeFile,
    showItems,
    toggleItems: () => setShowItems((v) => !v),
    editor,
    editRow,
    addRow,
    closeEditor,
    saveRow,
    removeRow,
    removeInvalid,
  };
}
