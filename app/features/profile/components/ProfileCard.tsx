import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { Avatar } from "@/components/ui/Avatar";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleAvatarPress: any;
  styles: any;
  tokens: any;
  user: any;
}

export function ProfileCard({
  handleAvatarPress,
  styles,
  tokens,
  user,
}: Props) {
  return (
    <Animated.View style={styles.profileCard} entering={fadeInUp(0)}>
      {/* The badge is the affordance — tapping opens change/remove, which is
          otherwise an invisible gesture on a plain avatar. */}
      <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.85}>
        <Avatar
          name={user?.name}
          imageUri={user?.profilePic}
          size={64}
          style={user?.profilePic ? styles.avatar : styles.avatarPlaceholder}
          initialStyle={styles.avatarInitial}
        />
        <View style={styles.avatarEditBadge}>
          <Ionicons name="camera" size={moderateScale(12)} color={tokens.onBrand} />
        </View>
      </TouchableOpacity>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.profileName} numberOfLines={1}>{user?.name || "Your name"}</Text>
        <Text style={styles.profilePhone}>{user?.phone || ""}</Text>
      </View>
    </Animated.View>
  );
}
