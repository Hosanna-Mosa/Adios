import React from "react";
import { router } from "expo-router";
import { socketService } from "@/utils/socketService";
import { getOrder } from "@/services/orders.service";
import { showAlert } from "@/components/ui/AppAlert";
import { cancellationNotice } from "@/utils/cancellationNotice";
import {
  ASSIGNED_STATUSES, DEAD_STATUSES, DONE_STATUSES, SEARCHING_STATUSES, STARTED_STATUSES,
  isForOrder, orderPrice, toHelperDriver,
} from "./useHelperTask.shared";

// The searching and assigned steps follow the server: a poll of GET /orders/:id
// (the source of truth, and what catches up after the app was backgrounded) plus
// the order-room sockets for instant updates. Every socket payload is checked
// against this order's id — the customer's user room also carries events for
// their other orders.

export function useHelperTaskLiveStatus(step: any, setStep: any, localOrderId: string | null, setDriver: any, setServiceType: any, setStatus: any, setCurrentTaskPrice: any, setRejectedCount: any, setTotalContacted: any, setStartOtp: any, setAssignedDriver: any, setSearchExhausted: any, setOrderPaymentMethod: any, clearTask: () => void) {
  // One navigation / one notice per order, however many of poll and sockets report it.
  const handled = React.useRef<string | null>(null);
  React.useEffect(() => {
    handled.current = null;
  }, [localOrderId]);

  const applySnapshot = React.useCallback((order: any) => {
    setRejectedCount(order.declineReasons ? order.declineReasons.length : 0);
    setTotalContacted(order.totalCandidatesCount || 0);
    const price = orderPrice(order);
    if (price) setCurrentTaskPrice(price);
    if (order.restaurantPickupCode) setStartOtp(order.restaurantPickupCode);
    if (order.paymentMethod) setOrderPaymentMethod(order.paymentMethod === "online" ? "online" : "cash");
  }, [setRejectedCount, setTotalContacted, setCurrentTaskPrice, setStartOtp, setOrderPaymentMethod]);

  const goToAssigned = React.useCallback((driverInfo: any) => {
    const helper = toHelperDriver(driverInfo);
    if (helper) {
      setDriver(helper);
      setAssignedDriver(helper);
    }
    setServiceType("helper");
    setStatus("driver_assigned");
    setSearchExhausted(false);
    setStep("assigned");
  }, [setDriver, setAssignedDriver, setServiceType, setStatus, setSearchExhausted, setStep]);

  const goToTracking = React.useCallback(() => {
    if (!localOrderId || handled.current === localOrderId) return;
    handled.current = localOrderId;
    router.replace({ pathname: "/tracking", params: { orderId: localOrderId } });
  }, [localOrderId]);

  const onCancelled = React.useCallback((reason?: string | null) => {
    if (!localOrderId || handled.current === localOrderId) return;
    handled.current = localOrderId;
    // The customer's own cancel already reset the screen.
    if (reason !== "customer_cancelled") {
      const notice = cancellationNotice(reason);
      showAlert(notice.title, notice.message);
    }
    clearTask();
  }, [localOrderId, clearTask]);

  React.useEffect(() => {
    if (step !== "searching" || !localOrderId) return;
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const orderData = await getOrder(localOrderId);
        if (!orderData || cancelled) return;
        applySnapshot(orderData);
        if (ASSIGNED_STATUSES.includes(orderData.status) && orderData.driver) goToAssigned(orderData.driver);
        else if (STARTED_STATUSES.includes(orderData.status) || DONE_STATUSES.includes(orderData.status)) goToTracking();
        else if (DEAD_STATUSES.includes(orderData.status)) onCancelled(orderData.cancelReason);
        // Saved by the server, so the "no helpers" state survives a reopen; a price raise clears it.
        else setSearchExhausted(!!orderData.searchExhaustedAt);
      } catch (err) {
        console.warn("Error polling order status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    const onAccepted = (data: any) => {
      if (isForOrder(data, localOrderId)) goToAssigned(data?.driver);
    };
    const onStatus = (data: any) => {
      if (!isForOrder(data, localOrderId)) return;
      // The status event carries no helper details; the order does.
      if (ASSIGNED_STATUSES.includes(data?.status)) fetchStatus();
      else if (STARTED_STATUSES.includes(data?.status)) goToTracking();
      else if (DEAD_STATUSES.includes(data?.status)) onCancelled(data?.reason);
    };
    // Emitted once every candidate has passed (and again by the server's expiry sweep).
    const onNoDrivers = (data: any) => {
      if (isForOrder(data, localOrderId)) setSearchExhausted(true);
    };

    socketService.on("order_accepted", onAccepted);
    socketService.on("order_status_update", onStatus);
    socketService.on("no_drivers_available", onNoDrivers);

    return () => {
      cancelled = true;
      clearInterval(interval);
      socketService.off("order_accepted", onAccepted);
      socketService.off("order_status_update", onStatus);
      socketService.off("no_drivers_available", onNoDrivers);
    };
  }, [step, localOrderId, applySnapshot, goToAssigned, goToTracking, onCancelled, setSearchExhausted]);

  React.useEffect(() => {
    if (step !== "assigned" || !localOrderId) return;
    let cancelled = false;

    const onTaskStarted = (data: any) => {
      if (isForOrder(data, localOrderId)) goToTracking();
    };
    const onStatus = (data: any) => {
      if (!isForOrder(data, localOrderId)) return;
      if (STARTED_STATUSES.includes(data?.status) || DONE_STATUSES.includes(data?.status)) goToTracking();
      else if (DEAD_STATUSES.includes(data?.status)) onCancelled(data?.reason);
      // The helper let the task go and the server is searching again.
      else if (SEARCHING_STATUSES.includes(data?.status)) setStep("searching");
    };

    socketService.on("task_started", onTaskStarted);
    socketService.on("order_status_update", onStatus);

    // Polled too, so a customer who had the app backgrounded when the helper
    // started still lands on tracking rather than on a stale panel.
    const poll = async () => {
      try {
        const orderData = await getOrder(localOrderId);
        if (!orderData || cancelled) return;
        applySnapshot(orderData);
        if (orderData.driver) setAssignedDriver(toHelperDriver(orderData.driver));
        if (STARTED_STATUSES.includes(orderData.status) || DONE_STATUSES.includes(orderData.status)) goToTracking();
        else if (DEAD_STATUSES.includes(orderData.status)) onCancelled(orderData.cancelReason);
        else if (SEARCHING_STATUSES.includes(orderData.status)) setStep("searching");
      } catch {
        // A failed poll is not worth surfacing; the socket is the primary path.
      }
    };
    const interval = setInterval(poll, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      socketService.off("task_started", onTaskStarted);
      socketService.off("order_status_update", onStatus);
    };
  }, [step, localOrderId, applySnapshot, goToTracking, onCancelled, setAssignedDriver, setStep]);

  // A raise (from this screen, a top-up settling, or another device) reaches the order room.
  React.useEffect(() => {
    if (!localOrderId) return;
    socketService.trackOrder(localOrderId);
    const onPriceUpdate = (data: any) => {
      if (isForOrder(data, localOrderId) && Number(data?.price) > 0) setCurrentTaskPrice(Number(data.price));
    };
    socketService.on("order_price_update", onPriceUpdate);
    return () => socketService.off("order_price_update", onPriceUpdate);
  }, [localOrderId, setCurrentTaskPrice]);
}
