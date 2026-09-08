import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  activeStartupAd: any;
  setActiveStartupAd: any;
  styles: any;
  tokens: any;
}

export function HomeStartupAdOverlay({
  activeStartupAd,
  setActiveStartupAd,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.startupAdOverlay}>
      <View style={styles.startupAdCard}>
        <TouchableOpacity style={styles.startupAdCloseBtn} onPress={() => setActiveStartupAd(null)}>
          <Feather name="x" size={moderateScale(16)} color={tokens.text} />
        </TouchableOpacity>
        <Image source={{ uri: activeStartupAd.imageUrl }} style={styles.startupAdImage} contentFit="cover" transition={200} />
        <View style={{ padding: 18 }}>
          <Text style={styles.startupAdTitle}>{activeStartupAd.title}</Text>
          {activeStartupAd.description && <Text style={styles.startupAdDescription}>{activeStartupAd.description}</Text>}
          <TouchableOpacity style={styles.startupAdBtn} onPress={() => setActiveStartupAd(null)}>
            <Text style={styles.startupAdBtnText}>Continue to app</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
