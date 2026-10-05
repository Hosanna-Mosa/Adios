import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { InfoRow } from "@/components/ui/InfoRow";
import { useToast } from "@/components/ui/Toast";
import { designTokens, radius, type ThemeTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useOrderAlertStore } from "@/contexts/orderAlertStore";
import { useRespondToScheduledRequest } from "@/queries/orders.queries";
import { errorMessage } from "@/utils/errorMessage";
import { formatLongDateTime } from "@/utils/format";

/**
 * Pops up over any screen the moment a customer asks for a scheduled delivery
 * — the mobile counterpart of the web panel's VendorScheduledRequestDialog.
 */
export function ScheduledRequestSheet() {
  const { t } = useTranslation();
  const toast = useToast();
  const tokens = designTokens[useThemeStore((s) => s.theme)];
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const request = useOrderAlertStore((s) => s.scheduledRequest);
  const dismiss = useOrderAlertStore((s) => s.dismissScheduledRequest);
  const respond = useRespondToScheduledRequest();

  const answer = (accepted: boolean) => {
    if (!request) return;
    respond.mutate(
      { requestId: request.requestId, accepted },
      {
        onSuccess: () => {
          toast.show(accepted ? t("scheduled.acceptedToast") : t("scheduled.rejectedToast"), "success");
          dismiss();
        },
        onError: (error) => toast.show(errorMessage(error, t("scheduled.respondFailed")), "error"),
      },
    );
  };

  return (
    <BottomSheet
      visible={!!request}
      onClose={dismiss}
      dismissible={!respond.isPending}
      title={t("scheduled.newRequestTitle")}
      subtitle={t("scheduled.newRequestSubtitle")}
    >
      {request ? (
        <>
          <View style={styles.details}>
            <InfoRow icon="calendar-outline" text={formatLongDateTime(request.scheduledFor)} strong />
            <InfoRow icon="person-outline" text={request.customerName || t("common.customer")} />
            <InfoRow icon="call-outline" text={request.customerPhone || t("common.notAvailable")} />
          </View>
          <View style={styles.actions}>
            <Button
              title={t("actions.reject")}
              variant="secondary"
              onPress={() => answer(false)}
              disabled={respond.isPending}
              style={styles.flex}
            />
            <Button
              title={t("actions.accept")}
              onPress={() => answer(true)}
              loading={respond.isPending}
              style={styles.flex}
            />
          </View>
          <Button
            title={t("scheduled.viewAll")}
            variant="ghost"
            size="sm"
            onPress={() => {
              dismiss();
              router.push("/scheduled-orders");
            }}
          />
        </>
      ) : null}
    </BottomSheet>
  );
}

const createStyles = (tokens: ThemeTokens) =>
  StyleSheet.create({
    details: {
      backgroundColor: tokens.sunken,
      borderRadius: radius.md,
      padding: 14,
      gap: 10,
      marginTop: 18,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 18,
      marginBottom: 6,
    },
    flex: {
      flex: 1,
    },
  });
