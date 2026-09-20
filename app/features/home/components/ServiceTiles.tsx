import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from
// the screen's scope is now passed in as props.

interface Props {
  styles: any;
  tokens: ThemeTokens;
  activeService: string;
  handleServiceSwitch: (service: "Food" | "Meat") => void;
}

export function ServiceTiles({
  styles,
  tokens,
  activeService,
  handleServiceSwitch,
}: Props) {
  return (
    <View style={styles.tilesRow}>
      <View style={styles.togglePill}>
        <TouchableOpacity
          style={[styles.toggleCell, activeService === "Food" && { backgroundColor: tokens.surface, borderColor: tokens.services.food.accent }]}
          onPress={() => handleServiceSwitch("Food")}
          activeOpacity={0.85}
        >
          <View style={[styles.toggleIconCircle, { backgroundColor: activeService === "Food" ? tokens.services.food.accent : tokens.sunken }]}>
            <Text style={styles.toggleEmoji}>🍛</Text>
          </View>
          <Text style={[styles.toggleLabel, activeService === "Food" && { color: tokens.services.food.accent }]}>Food</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleCell, activeService === "Meat" && { backgroundColor: tokens.surface, borderColor: tokens.services.meat.accent }]}
          onPress={() => handleServiceSwitch("Meat")}
          activeOpacity={0.85}
        >
          <View style={[styles.toggleIconCircle, { backgroundColor: activeService === "Meat" ? tokens.services.meat.accent : tokens.sunken }]}>
            <Text style={styles.toggleEmoji}>🍖</Text>
          </View>
          <Text style={[styles.toggleLabel, activeService === "Meat" && { color: tokens.services.meat.accent }]}>Meat</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.launcherTile} onPress={() => router.push("/all-services")} activeOpacity={0.85}>
        <Text style={styles.launcherArrow}>↗</Text>
        <View style={[styles.launcherIconCircle, { backgroundColor: tokens.services.ride.skin }]}>
          <Text style={styles.launcherEmoji}>🛺</Text>
        </View>
        <Text style={styles.toggleLabel}>Ride</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.launcherTile} onPress={() => router.push("/helper-task")} activeOpacity={0.85}>
        <Text style={styles.launcherArrow}>↗</Text>
        <View style={[styles.launcherIconCircle, { backgroundColor: tokens.services.task.skin }]}>
          <Text style={styles.launcherEmoji}>🧰</Text>
        </View>
        <Text style={styles.toggleLabel}>Task</Text>
      </TouchableOpacity>
    </View>
  );
}
