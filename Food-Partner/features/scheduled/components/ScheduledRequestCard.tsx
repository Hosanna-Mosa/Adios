import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InfoRow } from "@/components/ui/InfoRow";
import type { ScheduledRequest, ScheduledRequestStatus } from "@/types/models";
import { formatDateTime, formatTime } from "@/utils/format";
import type { ScheduledStyles } from "../scheduled.styles";

interface Props {
  request: ScheduledRequest;
  responding: boolean;
  disabled: boolean;
  onRespond: (requestId: string, accepted: boolean) => void;
  onCall: (phone: string) => void;
  styles: ScheduledStyles;
}

const STATUS: Record<ScheduledRequestStatus, { tone: BadgeTone; icon: keyof typeof Ionicons.glyphMap; key: string }> = {
  pending: { tone: "warning", icon: "hourglass-outline", key: "scheduled.statusPending" },
  accepted: { tone: "success", icon: "checkmark-circle-outline", key: "scheduled.statusAccepted" },
  rejected: { tone: "error", icon: "close-circle-outline", key: "scheduled.statusRejected" },
};

/** One scheduled-delivery request — the web panel's VendorScheduledOrderItem. */
export function ScheduledRequestCard({ request, responding, disabled, onRespond, onCall, styles }: Props) {
  const { t, i18n } = useTranslation();
  const status = STATUS[request.status];
  const when = new Date(request.scheduledFor);
  const locale = i18n.language === "hi" ? "hi-IN" : i18n.language === "te" ? "te-IN" : "en-IN";

  return (
    <Card bordered elevationLevel="none" style={styles.card}>
      <View style={styles.top}>
        <View style={styles.dateTile}>
          <Text style={styles.month}>{when.toLocaleDateString(locale, { month: "short" })}</Text>
          <Text style={styles.day}>{when.getDate()}</Text>
        </View>
        <View style={styles.headTexts}>
          <Text style={styles.time}>{formatTime(request.scheduledFor)}</Text>
          <Text style={styles.weekday}>{when.toLocaleDateString(locale, { weekday: "long" })}</Text>
        </View>
        <Badge label={t(status.key)} tone={status.tone} icon={status.icon} />
      </View>

      <View style={styles.details}>
        <InfoRow icon="person-outline" text={request.customerName || t("common.customer")} strong />
        <InfoRow
          icon="call-outline"
          text={request.customerPhone || t("common.notAvailable")}
          onPress={request.customerPhone ? () => onCall(request.customerPhone) : undefined}
        />
      </View>

      <Text style={styles.meta}>
        {t("scheduled.requestedOn", { date: formatDateTime(request.createdAt) })}
        {request.respondedAt ? ` · ${t("scheduled.respondedOn", { date: formatDateTime(request.respondedAt) })}` : ""}
      </Text>
      <Text style={styles.reference}>{request.requestId}</Text>

      {request.status === "pending" ? (
        <View style={styles.actions}>
          <Button title={t("actions.reject")} variant="secondary" size="sm" disabled={disabled} onPress={() => onRespond(request.requestId, false)} style={styles.flex} />
          <Button title={t("actions.accept")} size="sm" loading={responding} disabled={disabled} onPress={() => onRespond(request.requestId, true)} style={styles.flex} />
        </View>
      ) : null}
    </Card>
  );
}
