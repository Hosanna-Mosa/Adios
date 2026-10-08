import { OrderStatus, ServiceType } from "../../database/models/Order";
import { ConflictError } from "../../utils/errors";

/**
 * Helper (task) orders move through one path:
 *
 *   SEARCHING_DRIVER → DRIVER_ASSIGNED → IN_PROGRESS → DELIVERED
 *
 * DRIVER_ASSIGNED is set by POST /orders/:id/accept. IN_PROGRESS needs the customer's start OTP
 * (`restaurantPickupCode`) and the customer's go-ahead in chat (`assignConfirmedAt`); DELIVERED
 * needs the completion PIN (`deliveryOtp`). Both codes are the customer's to share, so they are
 * never sent to the helper. A task can be cancelled until it starts.
 */

export const isHelperOrder = (order: any) => order?.serviceType === ServiceType.HELPER;

type HelperStage = "searching" | "assigned" | "started" | "done" | "cancelled";

export function helperStage(status: unknown): HelperStage | null {
  switch (String(status || "").toUpperCase()) {
    case OrderStatus.CREATED:
    case OrderStatus.SEARCHING_DRIVER:
      return "searching";
    case OrderStatus.DRIVER_ASSIGNED:
      return "assigned";
    case OrderStatus.IN_PROGRESS:
      return "started";
    case OrderStatus.DELIVERED:
    case OrderStatus.COMPLETED:
      return "done";
    case OrderStatus.CANCELLED:
      return "cancelled";
    default:
      return null;
  }
}

const NEXT: Record<HelperStage, HelperStage[]> = {
  searching: ["cancelled"], // "assigned" only through acceptOrder
  assigned: ["started", "cancelled"],
  started: ["done"],
  done: [],
  cancelled: [],
};

/** Throws unless a helper order may move from its current status to `next`. Setting the same stage again is a no-op. */
export function assertHelperTransition(current: unknown, next: unknown, actor: "customer" | "driver" | "staff" | string) {
  const from = helperStage(current);
  const to = helperStage(next);
  if (!to) {
    throw new ConflictError("That status doesn't apply to a helper task.");
  }
  if (from === to) return;
  // Staff can sort out a stuck task (e.g. cancel one that started by mistake).
  if (actor === "staff" && (to === "cancelled" || to === "done")) return;
  if (!from || !NEXT[from].includes(to)) {
    if (to === "cancelled" && from === "started") {
      throw new ConflictError("This task has already started and can't be cancelled. Please contact support.");
    }
    if (to === "done" && from === "assigned") {
      throw new ConflictError("Start the task with the customer's start OTP before completing it.");
    }
    throw new ConflictError(`A helper task can't go from ${current} to ${next}.`);
  }
}

/** Whether `next` is the "task started" status. */
export const isHelperStart = (next: unknown) => helperStage(next) === "started";
export const isHelperDone = (next: unknown) => helperStage(next) === "done";

/**
 * The customer's codes are taken out of what a helper is sent: the helper enters them, and
 * the server checks them. (Restaurant and ride orders are unchanged.)
 */
export function withoutCustomerCodes<T extends Record<string, any>>(json: T): T {
  if (!json || !isHelperOrder(json)) return json;
  const { deliveryOtp: _d, restaurantPickupCode: _r, ...rest } = json as any;
  return rest as T;
}

/** Push text for the customer of a helper task. Empty title = no push for that status. */
export function helperPushText(status: unknown, driverName?: string): { title: string; body: string } {
  switch (helperStage(status)) {
    case "assigned":
      return {
        title: "Helper assigned 🙋",
        body: `${driverName || "A helper"} accepted your task. Confirm the task in chat and share your start OTP when they arrive.`,
      };
    case "started":
      return { title: "Task started 🛠️", body: "Your helper has started the task. Give them your completion PIN once the work is done." };
    case "done":
      return { title: "Task completed ✅", body: "Your task is complete. Thank you for choosing us! Please rate your helper." };
    default:
      return { title: "", body: "" };
  }
}
