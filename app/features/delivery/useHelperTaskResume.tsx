import { useEffect, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import i18n from "@/i18n";
import { getOrder } from "@/services/orders.service";
import { showAlert } from "@/components/ui/AppAlert";
import { cancellationNotice } from "@/utils/cancellationNotice";
import {
  ASSIGNED_STATUSES, DEAD_STATUSES, DONE_STATUSES, STARTED_STATUSES,
  durationFromHours, orderPrice, stopCoords, toHelperDriver,
} from "./useHelperTask.shared";

// Two ways into the helper screen with something already filled in:
//  - /helper-task?orderId=…  reopens a posted task (active-order stripe, My Orders,
//    a notification) on the step the server says it is at;
//  - /helper-task?description=…&pickupLat=…  (Rebook in My Orders) pre-fills the form.

type Params = {
  orderId?: string;
  description?: string;
  pickupAddress?: string;
  pickupLat?: string;
  pickupLng?: string;
  dropAddress?: string;
  dropLat?: string;
  dropLng?: string;
  hours?: string;
};

type Place = { address?: string; coords: { lat: number; lng: number } | null };

export function useHelperTaskResume(s: any) {
  const params = useLocalSearchParams<Params>();
  const applied = useRef<string | null>(null);

  const fillForm = (description: string, pickup: Place, drop: Place, hours: number) => {
    if (description) s.setDescription(description);
    if (pickup.address) s.setPickupLocation(pickup.address);
    if (pickup.coords) {
      s.setPickupCoords(pickup.coords);
      s.setIsPickupValid(true);
    }
    if (drop.address) s.setDropoffLocation(drop.address);
    if (drop.coords) {
      s.setDropoffCoords(drop.coords);
      s.setIsDropoffValid(true);
    }
    if (hours > 0) {
      const d = durationFromHours(hours);
      s.setDurationMode(d.mode);
      s.setCustomHours(d.hours);
      s.setCustomMinutes(d.minutes);
    }
  };

  useEffect(() => {
    const key = params.orderId ? `order:${params.orderId}` : params.pickupLat || params.description ? `prefill:${params.pickupLat},${params.pickupLng},${params.description}` : null;
    if (!key || applied.current === key) return;
    applied.current = key;

    if (!params.orderId) {
      const num = (v?: string) => (v != null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
      const pLat = num(params.pickupLat), pLng = num(params.pickupLng), dLat = num(params.dropLat), dLng = num(params.dropLng);
      fillForm(
        params.description || "",
        { address: params.pickupAddress, coords: pLat != null && pLng != null ? { lat: pLat, lng: pLng } : null },
        { address: params.dropAddress, coords: dLat != null && dLng != null ? { lat: dLat, lng: dLng } : null },
        num(params.hours) ?? 0,
      );
      return;
    }

    const orderId = params.orderId;
    let cancelled = false;
    s.setIsResuming(true);
    getOrder(orderId)
      .then((order) => {
        if (cancelled || !order) return;
        const status = String(order.status || "");
        if (STARTED_STATUSES.includes(status) || DONE_STATUSES.includes(status)) {
          router.replace({ pathname: "/tracking", params: { orderId } });
          return;
        }

        const [first, ...rest] = order.stops || [];
        const drop = rest.find((st: any) => st?.type === "drop") || rest[rest.length - 1];
        fillForm(
          first?.items?.instructions || first?.instructions || "",
          { address: first?.address, coords: stopCoords(first) },
          { address: drop?.address, coords: drop ? stopCoords(drop) : null },
          Number(order.duration) || 0,
        );

        if (DEAD_STATUSES.includes(status)) {
          // Ended already: show why, and leave the form filled in to post it again.
          const notice = cancellationNotice(order.cancelReason);
          showAlert(notice.title, notice.message);
          return;
        }

        s.setLocalOrderId(orderId);
        s.setOrderId(orderId);
        s.setServiceType("helper");
        s.setOrderPaymentMethod(order.paymentMethod === "online" ? "online" : "cash");
        s.setCurrentTaskPrice(orderPrice(order));
        s.setRejectedCount(order.declineReasons ? order.declineReasons.length : 0);
        s.setTotalContacted(order.totalCandidatesCount || 0);
        if (order.restaurantPickupCode) s.setStartOtp(order.restaurantPickupCode);

        const helper = toHelperDriver(order.driver);
        if (ASSIGNED_STATUSES.includes(status) && helper) {
          s.setAssignedDriver(helper);
          s.setDriver(helper);
          s.setStatus("driver_assigned");
          s.setStep("assigned");
        } else {
          s.setStatus("confirmed");
          s.setSearchExhausted(!!order.searchExhaustedAt);
          s.setSearchStartedAt(order.createdAt ? new Date(order.createdAt).getTime() : Date.now());
          s.setStep("searching");
        }
      })
      .catch((error) => {
        console.warn("Helper task: failed to load order", error);
        if (!cancelled) showAlert(i18n.t("actions.error"), i18n.t("app.delivery.couldNotLoadTask"));
      })
      .finally(() => {
        if (!cancelled) s.setIsResuming(false);
      });

    return () => {
      cancelled = true;
      // Torn down before it answered (e.g. a dev double-mount): let the next run load it again.
      applied.current = null;
    };
  }, [params.orderId, params.pickupLat, params.pickupLng, params.description]);
}
