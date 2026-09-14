import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

// Moved out of app/cart.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  styles: any;
}

export function CartRestoringState({
  accent,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyWrap}>
      <ActivityIndicator color={accent.accent} />
      <Text style={styles.emptySubtitle}>{t("app.food.restoringYourCart")}</Text>
    </View>
  );
}
