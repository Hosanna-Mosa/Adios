import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleLogout: any;
  loading: any;
  styles: any;
  tokens: any;
}

export function ProfileSignOutBtn({
  handleLogout,
  loading,
  styles,
  tokens,
}: Props) {
  return (
    <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} disabled={loading} activeOpacity={0.8}>
      {loading ? <ActivityIndicator size="small" color={tokens.error} /> : <Text style={styles.signOutBtnText}>Sign out</Text>}
    </TouchableOpacity>
  );
}
