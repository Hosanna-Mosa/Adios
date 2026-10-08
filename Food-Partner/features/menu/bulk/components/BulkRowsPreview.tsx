import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextField } from "@/components/ui/TextField";
import type { ThemeTokens } from "@/constants/colors";
import { PriceTag } from "../../components/PriceTag";
import { VegMarker } from "../../components/VegMarker";
import type { BulkStyles } from "../bulk.styles";
import type { ParsedRow } from "../parseRows";

// A sheet can hold 500 rows; drawing every one would make the screen sluggish.
// Rows with errors come first, so everything that needs fixing is always shown.
const SHOWN = 150;

interface Props {
  rows: ParsedRow[];
  invalidCount: number;
  onEdit: (row: ParsedRow) => void;
  onRemove: (row: ParsedRow) => void;
  onRemoveInvalid: () => void;
  styles: BulkStyles;
  tokens: ThemeTokens;
}

/** Matches name, category or the row number ("12" finds row 12). */
const matches = (row: ParsedRow, query: string) =>
  !query || row.name.toLowerCase().includes(query) || row.category.toLowerCase().includes(query) || String(row.sheetRow) === query;

/** The rows read from the sheet, searchable, each editable and removable; rows with errors highlighted and listed first. */
export function BulkRowsPreview({ rows, invalidCount, onEdit, onRemove, onRemoveInvalid, styles, tokens }: Props) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const ordered = useMemo(
    () =>
      rows
        .filter((row) => matches(row, query))
        .sort((a, b) => Number(!a.errors.length) - Number(!b.errors.length) || a.sheetRow - b.sheetRow),
    [rows, query],
  );
  const shown = ordered.slice(0, Math.max(SHOWN, invalidCount));

  return (
    <View style={styles.rows}>
      <SectionHeader title={t("bulkUpload.previewTitle")} />
      <TextField
        placeholder={t("bulkUpload.searchPlaceholder")}
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        autoCorrect={false}
        icon={<Ionicons name="search" size={18} color={tokens.muted} />}
        right={
          search ? (
            <IconButton icon="close-circle" onPress={() => setSearch("")} accessibilityLabel={t("bulkUpload.clearSearch")} color={tokens.muted} size={28} />
          ) : undefined
        }
      />
      {query ? <Text style={styles.rowMeta}>{t("bulkUpload.searchCount", { n: ordered.length, total: rows.length })}</Text> : null}
      {query && !ordered.length ? <Text style={styles.more}>{t("bulkUpload.noSearchResults", { query: search.trim() })}</Text> : null}
      {invalidCount ? (
        <Button
          title={t("bulkUpload.removeInvalid")}
          variant="secondary"
          size="sm"
          onPress={onRemoveInvalid}
          icon={<Ionicons name="trash-outline" size={16} color={tokens.error} />}
        />
      ) : null}
      {shown.map((row) => (
        <View key={row.sheetRow} style={[styles.row, row.errors.length ? styles.rowInvalid : null]}>
          <View style={styles.rowHead}>
            <Text style={styles.rowNumber}>{row.isNew ? t("bulkUpload.newRow") : t("bulkUpload.rowNumber", { row: row.sheetRow })}</Text>
            <VegMarker isVeg={row.isVeg} styles={styles} tokens={tokens} />
            <Text style={styles.rowName} numberOfLines={1}>
              {row.name || "—"}
            </Text>
            <IconButton icon="create-outline" onPress={() => onEdit(row)} accessibilityLabel={t("bulkUpload.editAction", { row: row.sheetRow })} size={34} />
            <IconButton
              icon="trash-outline"
              onPress={() => onRemove(row)}
              accessibilityLabel={t("bulkUpload.deleteAction", { row: row.sheetRow })}
              color={tokens.error}
              size={34}
            />
          </View>
          <View style={styles.rowMetaLine}>
            {row.category ? <Text style={styles.rowMeta}>{row.category}</Text> : null}
            {row.edited ? <Badge label={t("bulkUpload.edited")} tone="info" /> : null}
          </View>
          {row.price ? <PriceTag price={row.price} offerPrice={row.offerPrice} tokens={tokens} compact /> : null}
          {row.errors.map((error) => (
            <Text key={error.key} style={styles.error}>
              • {t(error.key, error.params)}
            </Text>
          ))}
        </View>
      ))}
      {ordered.length > shown.length ? <Text style={styles.more}>{t("bulkUpload.moreRows", { count: ordered.length - shown.length })}</Text> : null}
    </View>
  );
}
