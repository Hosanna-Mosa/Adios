import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import type { ThemeTokens } from "@/constants/colors";
import type { MenuStyles } from "../menu.styles";

interface Props {
  onAddDish: () => void;
  onBulkUpload: () => void;
  styles: MenuStyles;
  tokens: ThemeTokens;
}

/** The Menu tab's title actions: bulk upload from Excel, and "Add dish". */
export function MenuTitleActions({ onAddDish, onBulkUpload, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.titleActions}>
      <IconButton
        icon="cloud-upload-outline"
        size={38}
        color={tokens.brand}
        background={tokens.brandSkin}
        accessibilityLabel={t("bulkUpload.title")}
        onPress={onBulkUpload}
      />
      <Button title={t("menu.addDish")} size="sm" icon={<Ionicons name="add" size={18} color={tokens.onBrand} />} onPress={onAddDish} />
    </View>
  );
}
