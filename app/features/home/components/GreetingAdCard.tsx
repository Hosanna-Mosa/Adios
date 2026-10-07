import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { type Banner } from "@/types/models";
import { hasLink, openLink } from "@/utils/openLink";
import { type HomeStyles } from "../home.styles";

// The "below greetings" ad card. Banners with a targetUrl (e.g. a partner
// sale page set from the admin panel) are tappable and open that link.

interface Props {
  banner: Banner;
  styles: HomeStyles;
}

export function GreetingAdCard({ banner, styles }: Props) {
  const content = (
    <>
      <Image source={{ uri: banner.imageUrl }} style={styles.adImage} contentFit="cover" transition={200} />
      <View style={styles.adCaption}>
        <Text style={styles.adTitle}>{banner.title}</Text>
        {!!banner.description && <Text style={styles.adDescription}>{banner.description}</Text>}
      </View>
    </>
  );

  if (!hasLink(banner.targetUrl)) return <View style={styles.adCard}>{content}</View>;

  return (
    <Pressable
      style={({ pressed }) => [styles.adCard, pressed && { opacity: 0.85 }]}
      onPress={() => openLink(banner.targetUrl)}
      accessibilityRole="link"
      accessibilityLabel={banner.title}
    >
      {content}
    </Pressable>
  );
}
