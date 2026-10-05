import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { RefreshList } from "@/components/ui/RefreshList";
import type { ThemeTokens } from "@/constants/colors";
import type { ScheduledRequest, ScheduledRequestStatus } from "@/types/models";
import type { ScheduledStyles } from "../scheduled.styles";
import { ScheduledRequestCard } from "./ScheduledRequestCard";

interface Props {
  requests: ScheduledRequest[];
  filter: ScheduledRequestStatus;
  loading: boolean;
  error: boolean;
  respondingId: string | null;
  answer: (requestId: string, accepted: boolean) => void;
  call: (phone: string) => void;
  refreshing: boolean;
  refresh: () => void;
  bottomInset: number;
  styles: ScheduledStyles;
  tokens: ThemeTokens;
}

const EMPTY_KEY: Record<ScheduledRequestStatus, string> = {
  pending: "scheduled.emptyPending",
  accepted: "scheduled.emptyAccepted",
  rejected: "scheduled.emptyRejected",
};

/** Requests in the selected state, soonest first. */
export function ScheduledList(p: Props) {
  const { t } = useTranslation();
  if (p.loading) return <FullScreenLoader color={p.tokens.brand} style={{ flex: 1 }} />;
  return (
    <RefreshList
      data={p.requests}
      keyExtractor={(r) => r.requestId}
      refreshing={p.refreshing}
      onRefresh={p.refresh}
      bottomInset={p.bottomInset}
      renderItem={(request) => (
        <ScheduledRequestCard
          request={request}
          responding={p.respondingId === request.requestId}
          disabled={!!p.respondingId}
          onRespond={p.answer}
          onCall={p.call}
          styles={p.styles}
        />
      )}
      ListEmptyComponent={
        p.error ? (
          <EmptyState icon="cloud-offline-outline" title={t("errors.loadFailed")} subtitle={t("errors.checkConnection")} actionLabel={t("actions.tryAgain")} onAction={p.refresh} />
        ) : (
          <EmptyState icon="calendar-clear-outline" title={t(EMPTY_KEY[p.filter])} subtitle={t("scheduled.emptyHint")} />
        )
      }
    />
  );
}
