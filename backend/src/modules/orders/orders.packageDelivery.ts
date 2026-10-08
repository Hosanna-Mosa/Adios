import type { IPackageDelivery, ServiceType } from "../../database/models/Order";
import { ValidationError } from "../../utils/errors";
import { PACKAGE_DELIVERY_SERVICE_TYPES, packageDeliverySchema } from "./orders.validation";

/**
 * The package delivery details of a bike/auto order booked from the customer app's Package delivery flow,
 * checked exactly as POST /orders checks them. No package delivery input means an ordinary order.
 *
 * Its own file so both OrdersService and the online checkout can use it: /payments takes
 * orderData unvalidated, so the checkout has to refuse bad package delivery details before charging.
 */
/**
 * A package delivery has no start PIN — the captain collects the package and goes — but it
 * can only be completed with the delivery OTP, which the sender shares with the receiver.
 */
export const isPackageDeliveryOrder = (order: any): boolean => !!order?.packageDelivery;

/**
 * An order as its driver may see it. A package delivery's `deliveryOtp` is the receiver's
 * to give, so it is never sent to the driver — the backend checks what they type instead.
 * Other orders pass unchanged. Takes a document or plain object; returns plain JSON.
 */
export function withoutDriverSecrets<T = any>(order: any): T {
  if (!order) return order;
  const json = typeof order.toJSON === "function" ? order.toJSON() : { ...order };
  if (isPackageDeliveryOrder(json)) delete json.deliveryOtp;
  return json;
}

export function resolvePackageDelivery(serviceType: ServiceType | string | undefined, input: unknown): IPackageDelivery | undefined {
  if (input == null) return undefined;
  if (!PACKAGE_DELIVERY_SERVICE_TYPES.includes(String(serviceType))) {
    throw new ValidationError("Package delivery is only available by bike or auto");
  }
  const parsed = packageDeliverySchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message || "Invalid package delivery details");
  }
  return parsed.data;
}
