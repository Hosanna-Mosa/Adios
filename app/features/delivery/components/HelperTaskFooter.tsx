import { Text, TouchableOpacity, View } from "react-native";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleCancel: any;
  insets: any;
  styles: any;
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
