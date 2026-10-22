import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";
import { useTranslation } from "react-i18next";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from
// the screen's scope is now passed in as props.

interface Props {
  styles: HomeStyles;
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
  const { t } = useTranslation();
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
          <Text style={[styles.toggleLabel, activeService === "Food" && { color: tokens.services.food.accent }]} numberOfLines={1}>{t("app.serviceMeta.food")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleCell, activeService === "Meat" && { backgroundColor: tokens.surface, borderColor: tokens.services.meat.accent }]}
          onPress={() => handleServiceSwitch("Meat")}
          activeOpacity={0.85}
        >
          <View style={[styles.toggleIconCircle, { backgroundColor: activeService === "Meat" ? tokens.services.meat.accent : tokens.sunken }]}>
            <Text style={styles.toggleEmoji}>🍖</Text>
          </View>
          <Text style={[styles.toggleLabel, activeService === "Meat" && { color: tokens.services.meat.accent }]} numberOfLines={1}>{t("app.serviceMeta.meat")}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.launcherTile} onPress={() => router.push("/all-services")} activeOpacity={0.85}>
        <Text style={styles.launcherArrow}>↗</Text>
        <View style={[styles.launcherIconCircle, { backgroundColor: tokens.services.ride.skin }]}>
          <Text style={styles.launcherEmoji}>🚖</Text>
        </View>
        <Text style={styles.toggleLabel} numberOfLines={1}>{t("app.serviceMeta.ride")}</Text>
      </TouchableOpacity>
      {/* Package delivery and Hire a helper are services of their own, not part of Rides. */}
      <View style={styles.togglePill}>
        <TouchableOpacity style={styles.toggleCell} onPress={() => router.push("/package-delivery")} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={t("app.serviceMeta.packageDelivery")}>
          <View style={[styles.toggleIconCircle, { backgroundColor: tokens.services.delivery.skin }]}>
            <Text style={styles.toggleEmoji}>📦</Text>
          </View>
          <Text style={styles.toggleLabel} numberOfLines={1}>{t("app.home.packageShort")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleCell} onPress={() => router.push("/helper-task")} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={t("app.home.hireAHelper")}>
          <View style={[styles.toggleIconCircle, { backgroundColor: tokens.services.task.skin }]}>
            <Text style={styles.toggleEmoji}>🧰</Text>
          </View>
          <Text style={styles.toggleLabel} numberOfLines={1}>{t("app.home.helperShort")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
