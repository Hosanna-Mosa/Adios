import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import type { ThemeTokens } from "@/constants/colors";
import type { OrderDetailStyles } from "../orderDetail.styles";

interface Props {
  onPress: () => void;
  loading: boolean;
  styles: OrderDetailStyles;
  tokens: ThemeTokens;
}

/** The kitchen's one action on an order, pinned in the screen footer while it applies. */
export function MarkReadyFooter({ onPress, loading, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={styles.readyHint}>{t("orderDetail.readyHint")}</Text>
      <Button
        title={t("orderDetail.markReady")}
        icon={<Ionicons name="checkmark-circle" size={20} color={tokens.onBrand} />}
        onPress={onPress}
        loading={loading}
        fullWidth
      />
    </>
  );
}
