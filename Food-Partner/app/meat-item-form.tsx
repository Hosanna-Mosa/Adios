import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { MeatDetailsCard, MeatPhotoCard, MeatStockCard } from "@/features/menu/components/MeatFormCards";
import { useMeatItemForm } from "@/features/menu/useMeatItemForm";

/** /meat-item-form adds a meat item; /meat-item-form?id=… edits one (and can delete it). */
export default function MeatItemFormScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const f = useMeatItemForm(id ? String(id) : undefined);
  const header = <Header title={f.isEdit ? t("meatForm.editTitle") : t("meatForm.addTitle")} onBack={() => router.back()} backDisabled={f.saving} />;

  if (f.loadingItem || f.notFound) {
    return (
      <ScreenShell style={{ paddingTop: f.insets.top + 8 }} header={header}>
        {f.loadingItem ? (
          <FullScreenLoader color={f.tokens.brand} style={{ flex: 1 }} />
        ) : (
          <EmptyState icon="alert-circle-outline" title={t("meatForm.notFound")} actionLabel={t("actions.goBack")} onAction={() => router.back()} />
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
      footer={<Button title={f.isEdit ? t("dishForm.saveChanges") : t("meatForm.addItem")} onPress={f.submit} loading={f.saving} disabled={f.uploading || f.deleting} fullWidth />}
    >
      <MeatPhotoCard image={f.form.image} uploading={f.uploading} onChange={f.changePhoto} styles={f.styles} />
      <MeatDetailsCard form={f.form} update={f.update} errors={f.errors} categories={f.categories} fixedIdentity={f.fixedIdentity} styles={f.styles} tokens={f.tokens} />
      <MeatStockCard value={f.form.isAvailable} onChange={(v) => f.update("isAvailable", v)} styles={f.styles} />
      {f.isEdit && !f.fixedIdentity ? (
        <Button title={t("meatForm.delete")} variant="danger" icon={<Ionicons name="trash-outline" size={18} color={f.tokens.onBrand} />} onPress={f.confirmDelete} loading={f.deleting} fullWidth />
      ) : null}
    </ScreenShell>
  );
}
