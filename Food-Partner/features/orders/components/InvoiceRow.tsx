import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ListRow } from "@/components/ui/ListRow";
import type { ThemeTokens } from "@/constants/colors";

interface Props {
  opening: boolean;
  onPress: () => void;
  tokens: ThemeTokens;
}

/** Opens the finished order's invoice in the browser, where it can be printed or saved as a PDF. */
export function InvoiceRow({ opening, onPress, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <ListRow
      card
      icon="document-text-outline"
      iconColor={tokens.brand}
      iconBackground={tokens.brandSkin}
      label={t("orderDetail.invoice")}
      description={t("orderDetail.invoiceHint")}
      onPress={opening ? undefined : onPress}
      right={<Ionicons name={opening ? "hourglass-outline" : "open-outline"} size={18} color={tokens.muted} />}
    />
  );
}
