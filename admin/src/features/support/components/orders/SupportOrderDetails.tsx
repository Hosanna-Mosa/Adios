import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bike, ChevronDown, ChevronRight, Clock, CreditCard, MapPin, MessageSquare, ReceiptText, Store, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ServiceBadge } from "@/components/shared/ServiceBadge";
import { adminOrderStatusLabel } from "@/components/shared/adminOrderStatus";
import { formatDateTime, orderStatusVariant, rupees, serviceFieldsOf, type SupportOrder } from "../../supportOrderTypes";
import { SupportOrderChatLog } from "./SupportOrderChatLog";

function Section({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground break-words">{value}</span>
    </div>
  );
}

/**
 * Everything a support agent may see about one order, read-only. Phone numbers
 * arrive masked from the server, and handover codes are never sent.
 */
export function SupportOrderDetails({ order }: { order: SupportOrder }) {
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState(false);
  const isPackage = order.kind === "packageDelivery";
  const isHelper = order.kind === "helper";
  const driverLabel = isHelper ? t("supportOrders.helper") : t("supportOrders.driver");

  const events = [
    { at: order.timeline.createdAt, label: t("supportOrders.event.placed") },
    {
      at: order.timeline.restaurantAcceptedAt,
      label: order.timeline.prepMinutes
        ? t("supportOrders.event.outletAcceptedPrep", { minutes: order.timeline.prepMinutes })
        : t("supportOrders.event.outletAccepted"),
    },
    { at: order.timeline.foodReadyAt, label: t("supportOrders.event.foodReady") },
    { at: order.timeline.driverAcceptedAt, label: t("supportOrders.event.driverAccepted", { role: driverLabel }) },
    { at: order.timeline.assignConfirmedAt, label: t("supportOrders.event.taskConfirmed") },
    { at: order.timeline.taskStartedAt, label: t("supportOrders.event.taskStarted") },
    { at: order.timeline.taskCompletedAt, label: t("supportOrders.event.taskCompleted") },
    { at: order.timeline.searchExhaustedAt, label: t("supportOrders.event.searchExhausted", { role: driverLabel }) },
    { at: order.payment.cashCollectedAt, label: t("supportOrders.event.cashCollected") },
    { at: order.refund?.requestedAt, label: t("supportOrders.event.refundRequested") },
    { at: order.refund?.completedAt, label: t("supportOrders.event.refundCompleted") },
  ]
    .filter((e): e is { at: string; label: string } => !!e.at)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const paymentStatus = order.payment.status ? t(`supportOrders.paymentStatus.${order.payment.status}`, { defaultValue: order.payment.status }) : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">#{order._id}</h2>
        <StatusBadge status={adminOrderStatusLabel(order.status, t)} variant={orderStatusVariant(order.status)} />
        <ServiceBadge order={serviceFieldsOf(order)} />
        <span className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
      </div>

      {order.cancelReason && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {t("supportOrders.cancelledBecause")}: {t(`supportOrders.cancelReason.${order.cancelReason}`, { defaultValue: order.cancelReason })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Section icon={User} title={t("supportOrders.customer")}>
          <Row label={t("supportOrders.name")} value={order.customer.name || t("supportOrders.unknown")} />
          <Row label={t("supportOrders.phone")} value={order.customer.phone} />
          {order.bookingFor?.type === "someone_else" && (
            <Row label={t("supportOrders.bookedForSomeoneElse")} value={order.bookingFor.contactNumber} />
          )}
        </Section>

        <Section icon={Bike} title={driverLabel}>
          {order.driver ? (
            <>
              <Row label={t("supportOrders.name")} value={order.driver.name} />
              <Row label={t("supportOrders.phone")} value={order.driver.phone} />
              <Row label={t("supportOrders.vehicle")} value={order.driver.vehicleType} />
            </>
          ) : (
            <p className="text-sm italic text-muted-foreground">{t("supportOrders.noneAssigned")}</p>
          )}
          {order.dispatch && !order.driver && (
            <p className="mt-2 text-xs text-muted-foreground">
              {t("supportOrders.dispatchSummary", { state: order.dispatch.state, attempts: order.dispatch.attempts, candidates: order.dispatch.candidateCount })}
              {order.dispatch.failureReason ? ` · ${order.dispatch.failureReason}` : ""}
            </p>
          )}
        </Section>

        {order.outlet && (
          <Section icon={Store} title={order.outlet.partnerType === "meat" ? t("supportOrders.meatShop") : t("supportOrders.restaurant")}>
            <Row label={t("supportOrders.name")} value={order.outlet.name} />
            <Row label={t("supportOrders.phone")} value={order.outlet.phone} />
            <Row label={t("supportOrders.address")} value={order.outlet.address} />
          </Section>
        )}

        <Section icon={CreditCard} title={t("supportOrders.paymentAndPrice")}>
          <Row label={t("supportOrders.total")} value={rupees(order.pricing.total)} />
          {order.pricing.discountAmount > 0 && (
            <Row label={t("supportOrders.discount")} value={`−${rupees(order.pricing.discountAmount)}${order.pricing.couponCode ? ` (${order.pricing.couponCode})` : ""}`} />
          )}
          <Row label={t("supportOrders.method")} value={order.payment.method ? t(`supportOrders.paymentMethod.${order.payment.method}`) : ""} />
          <Row label={t("supportOrders.paymentStatusLabel")} value={paymentStatus} />
          {order.payment.cashCollectedAmount != null && <Row label={t("supportOrders.cashCollectedAmount")} value={rupees(order.payment.cashCollectedAmount)} />}
          {order.pricing.distanceKm != null && <Row label={t("supportOrders.distance")} value={t("service.km", { value: Number(order.pricing.distanceKm).toFixed(1) })} />}
          {order.refund && (
            <div className="mt-2 rounded-lg bg-muted/50 p-2">
              <Row label={t("supportOrders.refund")} value={t(`supportOrders.refundStatus.${order.refund.status}`, { defaultValue: order.refund.status })} />
              <Row label={t("supportOrders.refundAmount")} value={order.refund.amount != null ? rupees(order.refund.amount) : ""} />
              <Row label={t("supportOrders.refundReference")} value={order.refund.reference} />
              <Row label={t("supportOrders.refundFailure")} value={order.refund.failureReason} />
            </div>
          )}
        </Section>
      </div>

      {order.schedule && (
        <Section icon={Clock} title={t("supportOrders.scheduled")}>
          <Row label={t("supportOrders.scheduledFor")} value={formatDateTime(order.schedule.scheduledFor)} />
          <Row label={t("supportOrders.scheduleStatus")} value={order.schedule.status} />
          <Row label={t("supportOrders.rejectionReason")} value={order.schedule.rejectionReason} />
        </Section>
      )}

      <Section icon={MapPin} title={t("supportOrders.route")}>
        <ol className="space-y-3">
          {order.stops.map((stop, i) => {
            const contact = isPackage ? (i === 0 ? order.packageDelivery?.pickupContact : i === order.stops.length - 1 ? order.packageDelivery?.dropContact : null) : null;
            return (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t(`supportOrders.stopType.${stop.type}`, { defaultValue: stop.type })}</p>
                  <p className="text-foreground">{stop.address || t("supportOrders.noAddress")}</p>
                  {contact && (contact.name || contact.phone) && (
                    <p className="text-xs text-muted-foreground">{[contact.name, contact.phone].filter(Boolean).join(" · ")}</p>
                  )}
                  {stop.instructions && <p className="text-xs italic text-muted-foreground">“{stop.instructions}”</p>}
                </div>
              </li>
            );
          })}
        </ol>
        {isPackage && order.packageDelivery && (
          <p className="mt-3 text-xs text-muted-foreground">
            {t("service.cashPaidAt")}: {order.packageDelivery.payAt === "pickup" ? t("service.payAtPickup") : t("service.payAtDrop")}
          </p>
        )}
      </Section>

      {order.items.length > 0 && (
        <Section icon={ReceiptText} title={t("supportOrders.items")}>
          <ul className="divide-y divide-border text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between py-1.5">
                <span className="text-foreground">{item.quantity} × {item.name}</span>
                <span className="text-muted-foreground">{rupees(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section icon={Clock} title={t("supportOrders.timeline")}>
        <ol className="space-y-2 border-l border-border pl-4">
          {events.map((e, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
              <span className="text-foreground">{e.label}</span>
              <span className="ml-2 text-xs text-muted-foreground">{formatDateTime(e.at)}</span>
            </li>
          ))}
          <li className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-foreground">{t("supportOrders.event.current", { status: adminOrderStatusLabel(order.status, t) })}</span>
            <span className="ml-2 text-xs text-muted-foreground">{formatDateTime(order.updatedAt)}</span>
          </li>
        </ol>
      </Section>

      {order.driver && (
        <section className="rounded-xl border border-border bg-card">
          <button
            onClick={() => setShowChat((v) => !v)}
            className="flex w-full items-center gap-2 p-4 text-sm font-semibold text-foreground hover:bg-muted/40"
          >
            {showChat ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <MessageSquare className="h-4 w-4 text-primary" />
            {t("supportOrders.chatBetween", { role: driverLabel })}
          </button>
          {showChat && <SupportOrderChatLog orderId={order._id} />}
        </section>
      )}
    </div>
  );
}
