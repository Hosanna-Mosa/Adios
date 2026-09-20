import { Text, TouchableOpacity, View } from "react-native";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleCancel: () => void;
  insets: EdgeInsets;
  styles: HelperTaskStyles;
}

export function HelperTaskFooter({
  handleCancel,
  insets,
  styles,
}: Props) {
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
        <Text style={styles.cancelBtnText}>Cancel task</Text>
      </TouchableOpacity>
    </View>
  );
}
