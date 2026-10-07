import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { BulkStyles } from "../bulk.styles";
import type { FailedRow } from "../useBulkUpload";

interface Props {
  created: number;
  failed: FailedRow[];
  onDone: () => void;
  onAnother: () => void;
  styles: BulkStyles;
}

/** What the server did with the upload: how many dishes were added, and each row it refused with its reason. */
export function BulkResultCard({ created, failed, onDone, onAnother, styles }: Props) {
  const { t } = useTranslation();
  return (
    <Card bordered elevationLevel="none" style={styles.card}>
      <Text style={styles.resultTitle}>{t("bulkUpload.resultTitle", { count: created })}</Text>
      <View style={styles.summary}>
        <Badge label={t("bulkUpload.createdCount", { count: created })} tone="success" icon="checkmark-circle" />
        {failed.length ? <Badge label={t("bulkUpload.failedCount", { count: failed.length })} tone="error" icon="alert-circle" /> : null}
      </View>
      {failed.length ? <Text style={styles.body}>{t("bulkUpload.failedHint")}</Text> : null}
      {failed.map((row) => (
        <View key={`${row.sheetRow}-${row.error}`} style={[styles.row, styles.rowInvalid]}>
          <View style={styles.rowHead}>
            <Text style={styles.rowNumber}>{t("bulkUpload.rowNumber", { row: row.sheetRow })}</Text>
            <Text style={styles.rowName} numberOfLines={1}>
              {row.name || "—"}
            </Text>
          </View>
          <Text style={styles.error}>{row.error}</Text>
        </View>
      ))}
      <View style={styles.actions}>
        <Button title={t("bulkUpload.backToMenu")} onPress={onDone} fullWidth />
        <Button title={t("bulkUpload.uploadAnother")} variant="secondary" onPress={onAnother} fullWidth />
      </View>
    </Card>
  );
}
