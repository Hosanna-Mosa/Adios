import React from "react";
import { ActivityIndicator, Pressable, Text, View, TouchableOpacity } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { styles } from "./HighDemandAreas.styles";

export interface Hotspot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  surge: string;
  orderCount?: number;
}

interface HighDemandAreasProps {
  hotspots: Hotspot[];
  isLoading?: boolean;
  onAreaPress?: (area: Hotspot) => void;
}

export function HighDemandAreas({ hotspots, isLoading = false, onAreaPress }: HighDemandAreasProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>High Demand Areas</Text>
        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View all</Text>
          <Feather name="chevron-right" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.hotspotList}>
        {isLoading && (
          <View style={styles.loadingItem}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
        {hotspots.map((spot) => (
          <Pressable
            key={spot.id}
            style={styles.hotspotItem}
            onPress={() => onAreaPress?.(spot)}
          >
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="map-marker" size={16} color={Colors.primary} />
              </View>
            </View>
            <View style={styles.hotspotCopy}>
              <Text style={styles.hotspotName} numberOfLines={1}>
                {spot.name}
              </Text>
              <Text style={styles.hotspotAddress} numberOfLines={1}>
                {spot.address}
              </Text>
            </View>
            <View style={styles.surgeChip}>
              <Text style={styles.surgeChipText}>{spot.surge}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
