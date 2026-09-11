import { Text, TouchableOpacity, View } from "react-native";

// Moved out of app/helper-task.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  calculatedFare: any;
  createTask: any;
  insets: any;
  isCreating: any;
  offer: any;
  styles: any;
}

export function TaskBiddingPanel({
  calculatedFare,
  createTask,
  insets,
  isCreating,
  offer,
  styles,
}: Props) {
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <Text style={styles.helperCountNote}>Your offer is visible to nearby helpers once you tap Find a helper.</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={createTask} disabled={isCreating}>
        <Text style={styles.primaryBtnText}>Find a helper · ₹{offer ?? calculatedFare}</Text>
      </TouchableOpacity>
    </View>
  );
}
