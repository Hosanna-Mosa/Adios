import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { DishDetailsCard } from "@/features/menu/components/DishDetailsCard";
import { DishExtrasCard } from "@/features/menu/components/DishExtrasCard";
import { DishPhotosCard } from "@/features/menu/components/DishPhotosCard";
import { DishPreviewSheet } from "@/features/menu/components/DishPreviewSheet";
import { useDishForm } from "@/features/menu/useDishForm";
import { MAX_IMAGES } from "@/features/menu/useDishPhotos";

/** /dish-form adds a dish; /dish-form?id=… edits one. */
export default function DishFormScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const f = useDishForm(id ? String(id) : undefined);
  const header = <Header title={f.isEdit ? t("dishForm.editTitle") : t("dishForm.addTitle")} onBack={() => router.back()} backDisabled={f.saving} />;

  if (f.loadingItem || f.notFound) {
    return (
      <ScreenShell style={{ paddingTop: f.insets.top + 8 }} header={header}>
        {f.loadingItem ? (
          <FullScreenLoader color={f.tokens.brand} style={{ flex: 1 }} />
        ) : (
          <EmptyState icon="alert-circle-outline" title={t("dishForm.notFound")} actionLabel={t("actions.goBack")} onAction={() => router.back()} />
        )}
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      keyboardAvoiding
      style={{ paddingTop: f.insets.top + 8 }}
      header={header}
      scroll
      contentStyle={f.styles.content}
      footer={
        <Button title={f.isEdit ? t("dishForm.saveChanges") : t("dishForm.addToMenu")} onPress={f.submit} loading={f.saving} disabled={f.uploading} fullWidth />
      }
    >
      <DishPhotosCard
        images={f.form.images}
        max={MAX_IMAGES}
        uploading={f.uploading}
        error={f.errors.images}
        onAdd={f.addPhotos}
        onRemove={f.removeImage}
        styles={f.styles}
      />
      <DishDetailsCard form={f.form} update={f.update} errors={f.errors} categories={f.categories} discount={f.discount} styles={f.styles} tokens={f.tokens} />
      <DishExtrasCard form={f.form} update={f.update} errors={f.errors} styles={f.styles} tokens={f.tokens} />
      <DishPreviewSheet
        visible={f.previewing}
        form={f.form}
        isEdit={f.isEdit}
        saving={f.saving}
        onEdit={f.closePreview}
        onConfirm={f.confirm}
        tokens={f.tokens}
      />
    </ScreenShell>
  );
}
