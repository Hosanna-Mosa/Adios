import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import type { ThemeTokens } from "@/constants/colors";
import type { BulkStyles } from "../bulk.styles";

interface Props {
  fileName: string;
  total: number;
  validCount: number;
  invalidCount: number;
  showItems: boolean;
  onToggleItems: () => void;
  onAddRow: () => void;
  onRemoveFile: () => void;
  styles: BulkStyles;
  tokens: ThemeTokens;
}

/** The picked sheet at a glance: counts, View items, Add a dish and Remove file. The rows stay hidden until asked for. */
export function BulkSheetCard({ fileName, total, validCount, invalidCount, showItems, onToggleItems, onAddRow, onRemoveFile, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <Card bordered elevationLevel="none" style={styles.card}>
      <View style={styles.fileHead}>
        <View style={styles.fileIcon}>
          <Ionicons name="document-text" size={20} color={tokens.success} />
        </View>
        <View style={styles.fileTexts}>
          <Text style={styles.fileName} numberOfLines={1}>
            {fileName}
          </Text>
          <Text style={styles.rowMeta}>{t("bulkUpload.dishCount", { n: total })}</Text>
        </View>
        <IconButton icon="trash-outline" onPress={onRemoveFile} accessibilityLabel={t("bulkUpload.removeFile")} color={tokens.error} background={tokens.errorSkin} size={36} />
      </View>
      {total ? (
        <View style={styles.summary}>
          <Badge label={t("bulkUpload.validCount", { count: validCount })} tone="success" icon="checkmark-circle" />
          {invalidCount ? <Badge label={t("bulkUpload.invalidCount", { count: invalidCount })} tone="error" icon="alert-circle" /> : null}
        </View>
      ) : (
        <Text style={styles.body}>{t("bulkUpload.noRowsLeft")}</Text>
      )}
      {invalidCount ? <Text style={styles.body}>{t("bulkUpload.invalidHint")}</Text> : null}
      <View style={styles.sheetActions}>
        {total ? (
          <Button
            title={showItems ? t("bulkUpload.hideItems") : t("bulkUpload.viewItems", { n: total })}
            variant="secondary"
            onPress={onToggleItems}
            icon={<Ionicons name={showItems ? "eye-off-outline" : "list-outline"} size={18} color={tokens.text} />}
            style={styles.sheetAction}
          />
        ) : null}
        <Button
          title={t("bulkUpload.addRow")}
          variant="secondary"
          onPress={onAddRow}
          icon={<Ionicons name="add" size={18} color={tokens.text} />}
          style={styles.sheetAction}
        />
      </View>
    </Card>
  );
}
