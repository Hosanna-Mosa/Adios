import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ActionTile } from "@/components/ui/ActionTile";
import { Card } from "@/components/ui/Card";
import { ImageTile } from "@/components/ui/ImageTile";
import type { DishFormStyles } from "../dishForm.styles";

interface Props {
  images: string[];
  max: number;
  uploading: boolean;
  error?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  styles: DishFormStyles;
}

/** The dish's photos with an "Add photo" tile — the web panel's image dropzone, for touch. */
export function DishPhotosCard({ images, max, uploading, error, onAdd, onRemove, styles }: Props) {
  const { t } = useTranslation();
  return (
    <Card bordered elevationLevel="none" style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{t("dishForm.photos")}</Text>
        <Text style={styles.counter}>
          {images.length}/{max}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
        {images.map((uri, index) => (
          <ImageTile
            key={`${uri}-${index}`}
            uri={uri}
            tag={index === 0 ? t("dishForm.cover") : undefined}
            onRemove={() => onRemove(index)}
            removeLabel={t("dishForm.removePhoto")}
          />
        ))}
        {images.length < max ? <ActionTile dashed icon="camera-outline" label={t("dishForm.addPhoto")} loading={uploading} onPress={onAdd} /> : null}
      </ScrollView>
      <Text style={error ? styles.error : styles.hint}>{error ?? t("dishForm.photosHint")}</Text>
    </Card>
  );
}
