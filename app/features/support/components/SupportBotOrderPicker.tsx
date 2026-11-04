import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getBotOrders, type BotCategory } from "@/services/support.service";
import { type BotStyles } from "../supportBot.styles";
import { type ThemeTokens } from "@/constants/colors";

interface Props {
  category: BotCategory;
  selectedId: string | null;
  onPick: (orderId: string) => void;
  styles: BotStyles;
  tokens: ThemeTokens;
}

// Inline list of the customer's recent orders in the question's category, for "Change order".
export function SupportBotOrderPicker({ category, selectedId, onPick, styles, tokens }: Props) {
  const { t } = useTranslation();
  const isOrderCategory = category !== "payment" && category !== "general";
  const { data, isLoading } = useQuery({
    queryKey: ["support-bot", "orders", category],
    queryFn: () => getBotOrders(isOrderCategory ? category : undefined),
  });

  if (isLoading) return <ActivityIndicator color={tokens.brand} />;
  if (!data?.length) return <Text style={styles.orderOptionMeta}>{t("app.supportBot.noOrders")}</Text>;

  return (
    <View>
      {data.map((o) => (
        <TouchableOpacity
          key={o.id}
          style={[styles.orderOption, o.id === selectedId && styles.orderOptionSelected]}
          activeOpacity={0.7}
          onPress={() => onPick(o.id)}
        >
          <Text style={styles.orderOptionText}>#{o.id}</Text>
          <Text style={styles.orderOptionMeta}>
            {new Date(o.createdAt).toLocaleDateString([], { day: "numeric", month: "short" })}
            {o.totalPrice ? ` · ₹${Math.round(o.totalPrice)}` : ""}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
