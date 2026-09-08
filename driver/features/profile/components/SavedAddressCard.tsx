import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { styles } from "../saved-addresses.styles";

/** One saved address with edit and delete actions. */
export function SavedAddressCard({
  address,
  index,
  onEdit,
  onDelete,
}: {
  address: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Animated.View entering={staggerListItem(index)} style={styles.addressCard}>
      <View style={styles.addressIconBox}>
        <Feather
          name={
            address.label === "Home"
              ? "home"
              : address.label === "Work" || address.label === "Office"
              ? "briefcase"
              : "map-pin"
          }
          size={20}
          color={Colors.textSecondary}
        />
      </View>
      <View style={styles.addressInfo}>
        <Text style={styles.addressLabel}>{address.label}</Text>
        <Text style={styles.addressLine} numberOfLines={2}>
          {address.addressLine}
        </Text>
        {address.phone && <Text style={styles.addressPhone}>{address.phone}</Text>}
      </View>
      <View style={styles.addressActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Feather name="edit-2" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Feather name="trash-2" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
