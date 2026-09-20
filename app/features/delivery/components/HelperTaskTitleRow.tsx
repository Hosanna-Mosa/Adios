import { Text, View } from "react-native";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: HelperTaskStyles;
}

export function HelperTaskTitleRow({
  styles,
}: Props) {
  return (
    <View style={styles.titleRow}>
      <View style={styles.spinner} />
      <Text style={styles.matchingTitle}>Finding a helper</Text>
    </View>
  );
}
