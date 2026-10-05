import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { CustomerCard } from "@/features/orders/components/CustomerCard";
import { DriverCard } from "@/features/orders/components/DriverCard";
import { AcceptOrderFooter } from "@/features/orders/components/AcceptOrderFooter";
import { MarkReadyFooter } from "@/features/orders/components/MarkReadyFooter";
import { OrderItemsCard } from "@/features/orders/components/OrderItemsCard";
import { OrderSummaryCard } from "@/features/orders/components/OrderSummaryCard";
import { useOrderDetail } from "@/features/orders/useOrderDetail";

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = useOrderDetail(String(id ?? ""));
  const header = <Header title={t("orderDetail.title")} onBack={() => router.back()} />;

  if (d.loading || !d.order) {
    return (
      <ScreenShell style={{ paddingTop: d.insets.top + 8 }}>
        {header}
        {d.loading ? (
          <FullScreenLoader color={d.tokens.brand} style={{ flex: 1 }} />
        ) : (
          <EmptyState
            icon="alert-circle-outline"
            title={d.error ? t("errors.loadFailed") : t("orderDetail.notFound")}
            subtitle={d.error ? t("errors.checkConnection") : undefined}
            actionLabel={d.error ? t("actions.tryAgain") : undefined}
            onAction={() => d.refetch()}
          />
        )}
      </ScreenShell>
    );
  }

  const footer = d.needsAcceptance ? (
    <AcceptOrderFooter
      acceptBy={d.order.restaurantAcceptBy}
      prepMinutes={d.prepMinutes}
      onPrepMinutesChange={d.setPrepMinutes}
      onAccept={d.acceptOrder}
      onReject={d.confirmReject}
      accepting={d.accepting}
      rejecting={d.rejecting}
      styles={d.styles}
      tokens={d.tokens}
    />
  ) : d.canMarkReady ? (
    <MarkReadyFooter onPress={d.confirmReady} loading={d.markingReady} styles={d.styles} tokens={d.tokens} />
  ) : undefined;

  return (
    <ScreenShell
      style={{ paddingTop: d.insets.top + 8 }}
      scroll
      refreshing={d.refreshing}
      onRefresh={() => d.refetch()}
      header={header}
      contentStyle={[d.styles.content, { paddingBottom: 24 + (footer ? 0 : d.insets.bottom) }]}
      footer={footer}
    >
      <OrderSummaryCard order={d.order} styles={d.styles} />
      <CustomerCard name={d.customer?.name} phone={d.customer?.phone} address={d.address} onCall={d.call} styles={d.styles} />
      <OrderItemsCard
        items={d.items}
        total={d.order.totalPrice}
        paymentMethod={d.order.paymentMethod}
        paymentStatus={d.order.paymentStatus}
        styles={d.styles}
      />
      <DriverCard
        hasDriver={d.hasDriver}
        awaitingAcceptance={d.needsAcceptance}
        name={d.driver?.user?.name}
        phone={d.driver?.user?.phone}
        vehicleType={d.driver?.vehicleType}
        onCall={d.call}
        tokens={d.tokens}
      />
    </ScreenShell>
  );
}
