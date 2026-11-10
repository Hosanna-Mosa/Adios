import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import type { ThemeTokens } from "@/constants/colors";
import type { EditProfileStyles } from "../editProfile.styles";
import type { ProfileImageKind } from "../useProfileImages";

interface Props {
  name: string;
  image?: string;
  coverImage?: string;
  busy: ProfileImageKind | null;
  onChange: (kind: ProfileImageKind) => void;
  styles: EditProfileStyles;
  tokens: ThemeTokens;
}

/** The outlet's cover banner with its profile picture on top; tap either to change it. */
export function ProfileImagesCard({ name, image, coverImage, busy, onChange, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.photos}>
      <Card bordered elevationLevel="none" padding={0} style={styles.cover} onPress={() => onChange("coverImage")} accessibilityLabel={t("editProfile.coverTitle")}>
        {coverImage ? <Image source={{ uri: coverImage }} style={styles.coverImage} contentFit="cover" transition={200} /> : null}
        <View style={styles.coverBadge}>
          {busy === "coverImage" ? <FullScreenLoader size="small" color={tokens.onBrand} /> : <Ionicons name="camera" size={16} color={tokens.onBrand} />}
          <Text style={styles.coverBadgeText}>{t(coverImage ? "editProfile.changeCover" : "editProfile.addCover")}</Text>
        </View>
      </Card>
      <Card elevationLevel="none" padding={0} style={styles.avatarWrap} onPress={() => onChange("image")} accessibilityLabel={t("editProfile.photoTitle")}>
        <Avatar name={name} imageUri={image} size={84} style={styles.avatar} />
        <View style={styles.avatarBadge}>
          {busy === "image" ? <FullScreenLoader size="small" color={tokens.onBrand} /> : <Ionicons name="camera" size={14} color={tokens.onBrand} />}
        </View>
      </Card>
    </View>
  );
}
