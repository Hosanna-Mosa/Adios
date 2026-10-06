import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import type { MeatItem } from "@/types/models";
import type { MeatStyles } from "../meat.styles";

interface Props {
  item: MeatItem | null;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  styles: MeatStyles;
}

/** Edit one item's selling price. */
export function MeatPriceSheet({ item, value, onChange, error, saving, onSave, onClose, styles }: Props) {
  const { t } = useTranslation();
  return (
    <BottomSheet
      visible={!!item}
      onClose={onClose}
      dismissible={!saving}
      title={t("meat.editPriceTitle")}
      subtitle={item ? [item.name, item.weight].filter(Boolean).join(" · ") : undefined}
    >
      <View style={styles.sheetBody}>
        <TextField
          label={t("meat.sellingPrice")}
          value={value}
          onChangeText={onChange}
          error={error}
          keyboardType="decimal-pad"
          autoFocus
          onSubmitEditing={onSave}
          icon={<Text style={styles.weight}>₹</Text>}
        />
        <Button title={t("meat.savePrice")} onPress={onSave} loading={saving} fullWidth />
      </View>
    </BottomSheet>
  );
}
