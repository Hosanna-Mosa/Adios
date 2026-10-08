import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { BulkResultCard } from "@/features/menu/bulk/components/BulkResultCard";
import { BulkRowEditor } from "@/features/menu/bulk/components/BulkRowEditor";
import { BulkRowsPreview } from "@/features/menu/bulk/components/BulkRowsPreview";
import { BulkSheetCard } from "@/features/menu/bulk/components/BulkSheetCard";
import { BulkSteps } from "@/features/menu/bulk/components/BulkSteps";
import { useBulkUpload } from "@/features/menu/bulk/useBulkUpload";

/** Add many dishes at once from an Excel sheet: download the template, fill it, upload it. */
export default function MenuBulkUploadScreen() {
  const { t } = useTranslation();
  const b = useBulkUpload();
  const canUpload = b.rows.length > 0 && !b.result;

  return (
    <ScreenShell
      style={{ paddingTop: b.insets.top + 8 }}
      header={<Header title={t("bulkUpload.title")} subtitle={t("bulkUpload.subtitle")} onBack={() => router.back()} backDisabled={b.uploading} />}
      scroll
      contentStyle={b.styles.content}
      footer={
        canUpload ? (
          <Button
            title={b.validCount ? t("bulkUpload.uploadCount", { count: b.validCount }) : t("bulkUpload.nothingToUpload")}
            onPress={b.send}
            loading={b.uploading}
            disabled={!b.validCount}
            icon={<Ionicons name="cloud-upload-outline" size={18} color={b.tokens.onBrand} />}
            fullWidth
          />
        ) : undefined
      }
    >
      {b.result ? (
        <BulkResultCard created={b.result.created} failed={b.result.failed} onDone={() => router.back()} onAnother={b.reset} styles={b.styles} />
      ) : (
        <BulkSteps
          sharing={b.sharing}
          onDownload={b.downloadTemplate}
          reading={b.reading}
          onChoose={b.chooseFile}
          fileName={b.fileName}
          sheetError={b.sheetError}
          styles={b.styles}
          tokens={b.tokens}
        />
      )}
      {b.fileName && !b.result && !b.sheetError ? (
        <BulkSheetCard
          fileName={b.fileName}
          total={b.rows.length}
          validCount={b.validCount}
          invalidCount={b.invalidCount}
          showItems={b.showItems}
          onToggleItems={b.toggleItems}
          onAddRow={b.addRow}
          onRemoveFile={b.removeFile}
          styles={b.styles}
          tokens={b.tokens}
        />
      ) : null}
      {canUpload && b.showItems ? (
        <BulkRowsPreview
          rows={b.rows}
          invalidCount={b.invalidCount}
          onEdit={b.editRow}
          onRemove={b.removeRow}
          onRemoveInvalid={b.removeInvalid}
          styles={b.styles}
          tokens={b.tokens}
        />
      ) : null}
      <BulkRowEditor editor={b.editor} onClose={b.closeEditor} onSave={b.saveRow} styles={b.styles} tokens={b.tokens} />
    </ScreenShell>
  );
}
