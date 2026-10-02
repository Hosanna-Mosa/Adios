import { Platform, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

// The support-chat header. Replaces SupportChatHeader{,2}: the same bar with a
// different back action and title block.
//
// With a `subtitle` the title sits in a flexed column (the conversation view);
// without one the title renders bare, exactly as the case-list view did — the
// wrapper View is not rendered at all in that case, so layout is unchanged.

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  insets: { top: number };
  styles: {
    header: object;
    backBtn: object;
    headerName: object;
    headerStatus: object;
  };
  tokens: { text: string };
}

export function SupportChatHeader({ title, subtitle, onBack, insets, styles, tokens }: Props) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      {subtitle ? (
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.headerName}>{title}</Text>
          <Text style={styles.headerStatus}>{subtitle}</Text>
        </View>
      ) : (
        <Text style={styles.headerName}>{title}</Text>
      )}
    </View>
  );
}
