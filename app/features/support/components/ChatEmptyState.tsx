import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/chat.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  partnerLabel: any;
  styles: any;
  tokens: any;
}

export function ChatEmptyState({
  partnerLabel,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={32} color={tokens.muted} />
      <Text style={styles.emptyStateText}>Messages with your {partnerLabel.toLowerCase()} will show up here.</Text>
    </View>
  );
}
