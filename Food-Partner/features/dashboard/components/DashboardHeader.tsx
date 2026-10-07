import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/IconButton";
import type { ThemeTokens } from "@/constants/colors";
import { fadeInDown } from "@/motion/presets";
import { greetingKey } from "@/utils/format";
import type { DashboardStyles } from "../dashboard.styles";

interface Props {
  name: string;
  image?: string;
  isMeat: boolean;
  /** From outletStatus() — the same reading the "Accepting orders" card uses; undefined until the profile loads. */
  status?: { label: string; tone: BadgeTone } | null;
  /** "4.3", or null when the outlet has no ratings yet. */
  rating: string | null;
  reviewCount: number;
  styles: DashboardStyles;
  tokens: ThemeTokens;
}

/** Greeting, outlet photo and name, outlet type, open/closed state and rating — all from the database. */
export function DashboardHeader({ name, image, isMeat, status, rating, reviewCount, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInDown(0)} style={styles.header}>
      <Avatar
        name={name}
        imageUri={image}
        size={52}
        style={{ backgroundColor: isMeat ? tokens.services.meat.skin : tokens.brandSkin }}
        initialStyle={{ color: isMeat ? tokens.services.meat.accent : tokens.brand }}
      />
      <View style={styles.headerTexts}>
        <Text style={styles.greeting}>{t(greetingKey())}</Text>
        <Text style={styles.outletName} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.roleRow}>
          <Badge label={isMeat ? t("roles.meatCenter") : t("roles.restaurant")} tone={isMeat ? "meat" : "brand"} icon={isMeat ? "storefront" : "restaurant"} />
          {status ? <Badge label={status.label} tone={status.tone} dot /> : null}
          {rating ? <Badge label={t("dashboard.rating", { rating, count: reviewCount })} tone="warning" icon="star" /> : null}
        </View>
      </View>
      <IconButton icon="headset-outline" accessibilityLabel={t("support.title")} onPress={() => router.push("/support")} />
    </Animated.View>
  );
}
