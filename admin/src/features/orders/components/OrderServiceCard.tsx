import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ServiceBadge } from "@/components/shared/ServiceBadge";
import type { Order, OrderContact } from "../orderDetailTypes";

interface OrderServiceCardProps {
  order: Order;
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

function Contact({ contact }: { contact?: OrderContact }) {
  const { t } = useTranslation();
  if (!contact?.name && !contact?.phone) return <span className="text-muted-foreground">{t("orders.notAvailableShort")}</span>;
  return (
    <>
      <p className="font-medium">{contact.name}</p>
      {contact.phone && (
        <a href={telHref(contact.phone)} className="text-primary hover:underline">{contact.phone}</a>
      )}
    </>
  );
}

/**
 * Which service the order is, who booked it, what it costs and how it's paid — and,
 * for a package delivery, the sender, the receiver and where the cash is collected.
 */
export function OrderServiceCard({ order }: OrderServiceCardProps) {
  const { t } = useTranslation();
  const customer = typeof order.user === "object" ? order.user : undefined;
  const paidOnline = order.paymentMethod === "online" && order.paymentStatus === "paid";
  const cashCollected = order.cashCollected || order.paymentStatus === "cash_collected";
  const pkg = order.packageDelivery;

  return (
    <div className="section-card p-5 mb-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <ServiceBadge order={order} />
        {typeof order.totalPrice === "number" && (
          <span className="text-lg font-bold text-foreground">₹{Math.round(order.totalPrice)}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t("orders.customer")}>
          <Contact contact={customer} />
        </Field>
        <Field label={t("service.payment")}>
          {paidOnline
            ? t("service.paidOnline")
            : cashCollected
              ? t("service.cashCollected")
              : t("service.cashPending")}
        </Field>
        {!!order.totalDistance && (
          <Field label={t("service.distance")}>{t("service.km", { value: order.totalDistance })}</Field>
        )}
      </div>

      {pkg && (
        <div className="border-t border-border pt-4 space-y-4">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{t("service.packageDeliveryDetails")}</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("service.sender")}>
              <Contact contact={pkg.pickupContact} />
            </Field>
            <Field label={t("service.receiver")}>
              <Contact contact={pkg.dropContact} />
            </Field>
            <Field label={t("service.cashPaidAt")}>
              {paidOnline
                ? t("service.prepaidOnline")
                : pkg.payAt === "drop"
                  ? t("service.payAtDrop")
                  : t("service.payAtPickup")}
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
