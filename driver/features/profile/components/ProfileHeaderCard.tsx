import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import { styles } from "../profile-tab.styles";

/** Avatar, name, join date and rating at the top of the profile tab. */
export function ProfileHeaderCard({
  name,
  initials,
  profilePic,
  memberSince,
  rating,
}: {
  name: string;
  initials: string;
  profilePic?: string | null;
  memberSince: string;
  rating: number;
}) {
  return (
    <Animated.View entering={fadeInUp(0)} style={styles.header}>
      <View style={styles.avatarWrap}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.avatarImage} contentFit="cover" transition={200} />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
        <View style={styles.onlineDot} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.memberSince}>Member since {memberSince}</Text>
      <View style={styles.ratingBadge}>
        <Feather name="star" size={11} color={Colors.white} />
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    </Animated.View>
  );
}
