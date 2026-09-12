import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { FormInput } from "./FormInput";
import { zoneSelectorStyles as styles } from "./ZoneSelector.styles";

export interface Zone {
  _id: string;
  name: string;
  description?: string | null;
}

/** Preferred-zone step: search, the matching list, and the chosen zone's card. */
export function ZoneSelector({
  zones,
  searchText,
  onSearchChange,
  isDropdownOpen,
  selectedZoneId,
  onSelectZone,
  onOpenZoneMap,
}: {
  zones: Zone[];
  searchText: string;
  onSearchChange: (t: string) => void;
  isDropdownOpen: boolean;
  selectedZoneId: string | null;
  onSelectZone: (id: string) => void;
  onOpenZoneMap: (zone: Zone) => void;
}) {
  const filtered = zones.filter((z) =>
    z.name.toLowerCase().includes(searchText.toLowerCase()),
  );
  const selected = zones.find((z) => z._id === selectedZoneId);

  return (
    <View style={styles.wrap}>
      <FormInput
        label="Search Zone"
        value={searchText}
        onChangeText={onSearchChange}
        placeholder="Search by city or zone name..."
        icon="search"
      />

      {isDropdownOpen && (
        <View style={styles.dropdown}>
          <ScrollView nestedScrollEnabled={true} style={styles.scroll}>
            {filtered.length === 0 ? (
              <Text style={styles.empty}>No matching zones found.</Text>
            ) : (
              filtered.map((z) => (
                <TouchableOpacity key={z._id} onPress={() => onSelectZone(z._id)} style={styles.row}>
                  <Text style={styles.rowText}>{z.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {selected && (
        <View style={styles.selectedWrap}>
          <Text style={styles.selectedLabel}>Selected Preferred Zone:</Text>
          <TouchableOpacity onPress={() => onOpenZoneMap(selected)} style={styles.selectedCard}>
            <View style={styles.selectedIconWrap}>
              <Feather name="map-pin" size={20} color={Colors.info} />
            </View>
            <View style={styles.selectedCopy}>
              <Text style={styles.selectedName}>{selected.name}</Text>
              <Text style={styles.selectedDesc}>
                {selected.description || "Operational geofence area."}
              </Text>
              <Text style={styles.selectedLink}>🗺️ View Zone Coverage Map</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.info} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
