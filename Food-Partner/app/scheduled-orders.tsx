import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { IconButton } from "@/components/ui/IconButton";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ScheduledList } from "@/features/scheduled/components/ScheduledList";
import { useScheduledOrders } from "@/features/scheduled/useScheduledOrders";
import type { ScheduledRequestStatus } from "@/types/models";

/** Customers asking for a delivery at a later time, to accept or decline. */
export default function ScheduledOrdersScreen() {
  const { t } = useTranslation();
  const s = useScheduledOrders();

  return (
    <ScreenShell
      style={{ paddingTop: s.insets.top + 8 }}
      header={
        <Header
          title={t("scheduled.title")}
          subtitle={t("scheduled.subtitle")}
          onBack={() => router.back()}
          right={<IconButton icon="refresh" accessibilityLabel={t("actions.refresh")} onPress={s.refresh} loading={s.refreshing} />}
        />
      }
    >
      <SegmentedControl<ScheduledRequestStatus>
        value={s.filter}
        onChange={s.setFilter}
        style={s.styles.segments}
        segments={[
          { key: "pending", label: t("scheduled.pending"), count: s.counts.pending },
          { key: "accepted", label: t("scheduled.accepted") },
          { key: "rejected", label: t("scheduled.rejected") },
        ]}
      />
      <ScheduledList
        requests={s.visible}
        filter={s.filter}
        loading={s.loading}
        error={s.error}
        respondingId={s.respondingId}
        answer={s.answer}
        call={s.call}
        refreshing={s.refreshing}
        refresh={s.refresh}
        bottomInset={s.insets.bottom + 24}
        styles={s.styles}
        tokens={s.tokens}
      />
    </ScreenShell>
  );
}
