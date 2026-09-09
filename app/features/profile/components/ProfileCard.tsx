import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handlePickImage: any;
  styles: any;
  user: any;
}

export function ProfileCard({
  handlePickImage,
  styles,
  user,
}: Props) {
  return (
    <Animated.View style={styles.profileCard} entering={fadeInUp(0)}>
      <TouchableOpacity onPress={handlePickImage} activeOpacity={0.85}>
        {user?.profilePic ? (
          <Image source={{ uri: user.profilePic }} style={styles.avatar} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{(user?.name || "U").charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.profileName} numberOfLines={1}>{user?.name || "Your name"}</Text>
        <Text style={styles.profilePhone}>{user?.phone || ""}</Text>
      </View>
    </Animated.View>
  );
}
