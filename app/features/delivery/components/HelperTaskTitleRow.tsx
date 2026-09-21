import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: HelperTaskStyles;
}

export function HelperTaskTitleRow({
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.titleRow}>
      <View style={styles.spinner} />
      <Text style={styles.matchingTitle}>{t("app.delivery.findingAHelper")}</Text>
    </View>
  );
}
