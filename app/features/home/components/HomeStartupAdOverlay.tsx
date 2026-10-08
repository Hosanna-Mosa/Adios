import { Pressable, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { hasLink, openLink } from "@/utils/openLink";
import { type HomeStyles } from "../home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeStartupAd: any;
  setActiveStartupAd: any;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function HomeStartupAdOverlay({
  activeStartupAd,
  setActiveStartupAd,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  const targetUrl = activeStartupAd?.targetUrl;
  const linked = hasLink(targetUrl);
  // Close first so the modal is not left over the app we hand the link to.
  const openAd = () => {
    setActiveStartupAd(null);
    openLink(targetUrl);
  };
  return (
    <View style={styles.startupAdOverlay}>
      <View style={styles.startupAdCard}>
        <TouchableOpacity style={styles.startupAdCloseBtn} onPress={() => setActiveStartupAd(null)}>
          <Feather name="x" size={moderateScale(16)} color={tokens.text} />
        </TouchableOpacity>
        <Pressable disabled={!linked} onPress={openAd} accessibilityRole={linked ? "link" : undefined} accessibilityLabel={activeStartupAd.title}>
          <Image source={{ uri: activeStartupAd.imageUrl }} style={styles.startupAdImage} contentFit="cover" transition={200} />
        </Pressable>
        <View style={{ padding: 18 }}>
          <Text style={styles.startupAdTitle}>{activeStartupAd.title}</Text>
          {activeStartupAd.description && <Text style={styles.startupAdDescription}>{activeStartupAd.description}</Text>}
          {linked ? (
            <TouchableOpacity style={styles.startupAdBtn} onPress={openAd} accessibilityRole="link">
              <Text style={styles.startupAdBtnText}>{t("app.home.viewOffer")}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startupAdBtn} onPress={() => setActiveStartupAd(null)}>
              <Text style={styles.startupAdBtnText}>{t("app.home.continueToApp")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
