import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ThemeTokens } from "@/constants/colors";
import { type DropLocationStyles } from "@/features/ride/drop-location.styles";

// Moved out of app/drop-location.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  serviceId: any;
  drop: any;
  handleAddStop: () => void;
  pickup: any;
  styles: DropLocationStyles;
  tokens: ThemeTokens;
}

export function DropActionRow({
  serviceId,
  drop,
  handleAddStop,
  pickup,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(80)} style={styles.actionRow}>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={handleAddStop}
      >
        <Text style={styles.actionBtnText}>{t("app.ride.addStop")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => router.push({
          pathname: "/map-picker",
          params: {
            serviceId,
            type: !pickup ? 'pickup' : 'drop',
            pickupName: pickup?.name,
            pickupLat: pickup?.lat,
            pickupLng: pickup?.lng,
            dropName: drop?.name,
            dropLat: drop?.lat,
            dropLng: drop?.lng,
          }
        })}
      >
        <Ionicons name="locate-outline" size={15} color={tokens.sec} />
        <Text style={styles.actionBtnText}>{t("app.ride.selectOnMap")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
