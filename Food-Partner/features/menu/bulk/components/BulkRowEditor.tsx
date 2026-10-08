import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { ThemeTokens } from "@/constants/colors";
import { sanitizeDecimal } from "@/utils/number";
import { createStyles as createFormStyles } from "../../dishForm.styles";
import { VegToggle } from "../../components/VegToggle";
import type { BulkStyles } from "../bulk.styles";
import { rowFromDraft, type RowDraft } from "../parseRows";
import type { RowEditor } from "../useBulkUpload";

interface Props {
  editor: RowEditor | null;
  onClose: () => void;
  onSave: (draft: RowDraft) => void;
  styles: BulkStyles;
  tokens: ThemeTokens;
}

type DraftField = Exclude<keyof RowDraft, "isVeg">;

// Which field each sheet check belongs to, so its message shows under that field.
const FIELD_OF: Record<string, DraftField> = {
  "bulkUpload.errors.nameRequired": "name",
  "bulkUpload.errors.categoryRequired": "category",
  "bulkUpload.errors.priceInvalid": "price",
  "bulkUpload.errors.offerInvalid": "offerPrice",
  "bulkUpload.errors.offerTooHigh": "offerPrice",
  "bulkUpload.errors.proteinInvalid": "protein",
  "bulkUpload.errors.caloriesInvalid": "calories",
};

/** Edit one sheet row, or add a dish to the sheet — checked with the same rules as an uploaded row. */
export function BulkRowEditor({ editor, onClose, onSave, styles, tokens }: Props) {
  const { t } = useTranslation();
  const formStyles = useMemo(() => createFormStyles(tokens), [tokens]);
  const [draft, setDraft] = useState<RowDraft | null>(editor?.draft ?? null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setDraft(editor?.draft ?? null);
    // A sheet row opens with its problems already showing; a new dish waits for the first Save.
    setTouched(editor?.sheetRow != null);
  }, [editor]);

  const errors = useMemo(() => {
    const out: Partial<Record<DraftField, string>> = {};
    if (!draft) return out;
    for (const error of rowFromDraft(draft, 0).errors) {
      const field = FIELD_OF[error.key];
      if (field && !out[field]) out[field] = t(error.key, error.params);
    }
    return out;
  }, [draft, t]);

  if (!editor || !draft) return null;

  const set = <K extends keyof RowDraft>(key: K, value: RowDraft[K]) => setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  const shown = (field: DraftField) => (touched ? errors[field] : undefined);
  const isNew = editor.sheetRow === null;
  const rupee = <Text style={formStyles.rupee}>₹</Text>;

  const save = () => {
    setTouched(true);
    if (Object.keys(errors).length) return;
    onSave({ ...draft, name: draft.name.trim(), category: draft.category.trim(), description: draft.description.trim() });
  };

  return (
    <BottomSheet
      visible
      onClose={onClose}
      title={isNew ? t("bulkUpload.newRowTitle") : t("bulkUpload.editRow")}
      subtitle={isNew ? t("bulkUpload.newRowSubtitle") : t("bulkUpload.editRowSubtitle", { row: editor.sheetRow })}
    >
      <ScrollView style={styles.editorScroll} contentContainerStyle={styles.editorBody} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TextField label={t("dishForm.name")} placeholder={t("dishForm.namePlaceholder")} value={draft.name} onChangeText={(v) => set("name", v)} error={shown("name")} maxLength={80} />
        <TextField
          label={t("dishForm.category")}
          placeholder={t("dishForm.categoryPlaceholder")}
          value={draft.category}
          onChangeText={(v) => set("category", v)}
          error={shown("category")}
          maxLength={40}
        />
        <View style={formStyles.row}>
          <TextField
            label={t("dishForm.price")}
            placeholder="299"
            value={draft.price}
            onChangeText={(v) => set("price", sanitizeDecimal(v))}
            error={shown("price")}
            keyboardType="decimal-pad"
            icon={rupee}
            containerStyle={formStyles.half}
          />
          <TextField
            label={t("dishForm.offerPrice")}
            placeholder={t("dishForm.optional")}
            value={draft.offerPrice}
            onChangeText={(v) => set("offerPrice", sanitizeDecimal(v))}
            error={shown("offerPrice")}
            keyboardType="decimal-pad"
            icon={rupee}
            containerStyle={formStyles.half}
          />
        </View>
        <VegToggle isVeg={draft.isVeg} onChange={(v) => set("isVeg", v)} styles={formStyles} tokens={tokens} />
        <TextField
          label={t("dishForm.description")}
          placeholder={t("dishForm.descriptionPlaceholder")}
          value={draft.description}
          onChangeText={(v) => set("description", v)}
          multiline
          multilineHeight={90}
          maxLength={300}
        />
        <View style={formStyles.row}>
          <TextField
            label={t("dishForm.protein")}
            placeholder={t("dishForm.optional")}
            value={draft.protein}
            onChangeText={(v) => set("protein", sanitizeDecimal(v))}
            error={shown("protein")}
            keyboardType="decimal-pad"
            right={<Text style={formStyles.unit}>g</Text>}
            containerStyle={formStyles.half}
          />
          <TextField
            label={t("dishForm.calories")}
            placeholder={t("dishForm.optional")}
            value={draft.calories}
            onChangeText={(v) => set("calories", sanitizeDecimal(v))}
            error={shown("calories")}
            keyboardType="decimal-pad"
            right={<Text style={formStyles.unit}>kcal</Text>}
            containerStyle={formStyles.half}
          />
        </View>
      </ScrollView>
      <View style={styles.editorActions}>
        <Button title={t("actions.cancel")} variant="secondary" onPress={onClose} style={styles.sheetAction} />
        <Button title={isNew ? t("bulkUpload.addRowConfirm") : t("bulkUpload.saveRow")} onPress={save} style={styles.sheetAction} />
      </View>
    </BottomSheet>
  );
}
