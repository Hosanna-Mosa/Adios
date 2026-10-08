import { SocketManager } from "../sockets/socket.manager";
import { NotificationService } from "./notification.service";
import Order, { OrderStatus } from "../database/models/Order";
import Driver, { DriverStatus } from "../database/models/Driver";

export interface CandidateDriverInfo {
  driverId: string; // Driver document _id string
  driverUserId: string; // Driver's User account _id string
  distanceMeters: number;
  driverName?: string;
  driverPhone?: string;
}

export interface ActiveDispatchSession {
  orderId: string;
  candidates: CandidateDriverInfo[];
  currentIndex: number;
  declinedDriverUserIds: Set<string>;
  timer?: NodeJS.Timeout;
  orderPayload: any;
  createdAt: number;
}

export class DispatchManagerService {
  private static instance: DispatchManagerService;
  private activeDispatches: Map<string, ActiveDispatchSession> = new Map();
  // 25s UI timer + 1s grace. Drivers poll GET /orders/driver/offer every ~3s rather than
  // holding a socket, so the window has to absorb that poll latency.
  private OFFER_TIMEOUT_MS = 26000;
  private OFFER_TIMEOUT_SECONDS = 25;
  // A driver without a socket still counts as reachable if their app reported a
  // location this recently (background tracking posts over REST).
  private LIVE_LOCATION_WINDOW_MS = 10 * 60 * 1000;

  private constructor() {}

  public static getInstance(): DispatchManagerService {
    if (!DispatchManagerService.instance) {
      DispatchManagerService.instance = new DispatchManagerService();
    }
    return DispatchManagerService.instance;
  }

  /**
   * Start sequential dispatch for an order to sorted candidate drivers
   */
  public async startDispatch(
    orderId: string,
    sortedCandidates: CandidateDriverInfo[],
    orderPayload: any
  ): Promise<boolean> {
    // Clear any existing session for this order
    this.cancelDispatch(orderId);

    if (!sortedCandidates || sortedCandidates.length === 0) {
      console.warn(`[DISPATCH MANAGER] No candidate drivers provided for order ${orderId}`);
      await this.markExhausted(orderId);
      this.notifyNoDriversAvailable(orderId, orderPayload?.customerUserId);
      return false;
    }

    // A fresh search (first dispatch, or an increasePrice re-dispatch) clears the
    // "no drivers" mark a polling customer app would otherwise keep showing.
    await Order.updateOne({ _id: orderId }, { $unset: { dispatchExhaustedAt: 1, currentOffer: 1 } }).catch((err: any) =>
      console.warn(`[DISPATCH MANAGER] Failed to reset dispatch state for ${orderId}:`, err.message)
    );

    console.log(`[DISPATCH MANAGER] Starting sequential dispatch for order ${orderId} with ${sortedCandidates.length} sorted candidates:`);
    sortedCandidates.forEach((c, idx) => {
      console.log(`   ${idx + 1}. Driver User ID: ${c.driverUserId} | Driver Doc ID: ${c.driverId} | Distance: ${Math.round(c.distanceMeters)}m`);
    });

    const session: ActiveDispatchSession = {
      orderId,
      candidates: sortedCandidates,
      currentIndex: 0,
      declinedDriverUserIds: new Set<string>(),
      orderPayload,
      createdAt: Date.now(),
    };

    this.activeDispatches.set(orderId, session);
    await this.offerNextDriver(orderId);
    return true;
  }

  /**
   * Offer the order to the current candidate driver in sequence
   */
  private async offerNextDriver(orderId: string) {
    const session = this.activeDispatches.get(orderId);
    if (!session) return;

    // Clear any existing timer
    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = undefined;
    }

    // Check if order was already accepted or cancelled in DB
    try {
      const dbOrder = await Order.findById(orderId);
      if (!dbOrder || dbOrder.status !== OrderStatus.SEARCHING_DRIVER) {
        console.log(`[DISPATCH MANAGER] Order ${orderId} is no longer searching (Status: ${dbOrder?.status}). Terminating dispatch.`);
        this.activeDispatches.delete(orderId);
        return;
      }
    } catch (e) {
      console.error(`[DISPATCH MANAGER] Error checking order status for ${orderId}:`, e);
    }

    const socketManager = SocketManager.getInstance();

    // Advance index past any already declined or invalid drivers
    while (session.currentIndex < session.candidates.length) {
      const candidate = session.candidates[session.currentIndex];

      // Skip if driver already declined
      if (session.declinedDriverUserIds.has(candidate.driverUserId)) {
        session.currentIndex++;
        continue;
      }

      // Check if driver is still online and available in DB
      let lastLocationAt: Date | undefined;
      try {
        const driverDoc = await Driver.findOne({ user: candidate.driverUserId });
        if (!driverDoc || driverDoc.status !== DriverStatus.ONLINE || driverDoc.isAvailable === false) {
          console.log(`[DISPATCH MANAGER] Skipping candidate driverUser ${candidate.driverUserId} (Status: ${driverDoc?.status}, Available: ${driverDoc?.isAvailable})`);
          session.currentIndex++;
          continue;
        }
        lastLocationAt = driverDoc.lastLocationAt;
      } catch (dErr) {
        session.currentIndex++;
        continue;
      }

      // The DB can say ONLINE/available for a driver whose app was killed or lost
      // connectivity without ever calling goOffline — nothing corrects that until
      // the driver reopens the app (a location ping flips isAvailable back to true,
      // see socket.manager's driver_location_update handler). Offering to that
      // driver anyway would just burn the full OFFER_TIMEOUT_MS on a phone that was
      // never going to answer, pushing every real candidate behind it further back
      // in the queue — from the customer's side, that IS "the ride never reaches a
      // driver" when it happens to the first candidate or two. Skip immediately
      // instead, and self-heal the DB so later searches (this ride's remaining
      // candidates, and every future ride) stop tripping over the same stale entry.
      //
      // A minimised app usually has no socket but keeps posting its location over
      // REST, and still gets the offer by push — so a recent location ping counts
      // as alive. The socket check covers every server instance, not just this one.
      const pingedRecently =
        lastLocationAt !== undefined && Date.now() - new Date(lastLocationAt).getTime() < this.LIVE_LOCATION_WINDOW_MS;
      if (!pingedRecently && !(await socketManager.isUserConnectedAnywhere(candidate.driverUserId))) {
        console.log(`[DISPATCH MANAGER] Skipping candidate driverUser ${candidate.driverUserId} — no live socket and no recent location (app likely closed).`);
        Driver.updateOne({ user: candidate.driverUserId }, { isAvailable: false }).catch((err: any) =>
          console.warn(`[DISPATCH MANAGER] Failed to mark disconnected driver ${candidate.driverUserId} unavailable:`, err.message)
        );
        session.currentIndex++;
        continue;
      }

      // Valid driver found! Break to offer
      break;
    }

    // If candidate index exhausted, attempt fallback / notify no drivers
    if (session.currentIndex >= session.candidates.length) {
      console.log(`⚠️ [DISPATCH MANAGER] All ${session.candidates.length} candidate drivers declined or were unavailable for order ${orderId}`);
      await this.markExhausted(orderId);
      this.notifyNoDriversAvailable(orderId, session.orderPayload?.customerUserId);
      this.activeDispatches.delete(orderId);
      return;
    }

    const currentCandidate = session.candidates[session.currentIndex];
    console.log(
      `🎯 [DISPATCH OFFER] Offering order ${orderId} to Driver #${session.currentIndex + 1}: ` +
      `User ${currentCandidate.driverUserId} (Doc: ${currentCandidate.driverId}, Distance: ${Math.round(currentCandidate.distanceMeters)}m)`
    );

    // 1. Emit Socket event to this specific driver
    const offeredAt = new Date();
    const expiresAt = new Date(offeredAt.getTime() + this.OFFER_TIMEOUT_MS);
    const payloadWithTimer = {
      ...session.orderPayload,
      offerTimeoutSeconds: this.OFFER_TIMEOUT_SECONDS,
      expiresAt: expiresAt.toISOString(),
      candidateSequenceIndex: session.currentIndex + 1,
      totalCandidateDrivers: session.candidates.length,
    };

    // Persisted so a driver app polling GET /orders/driver/offer sees the same offer the
    // socket carries. Only while still searching, so a late write can't revive a taken order.
    try {
      await Order.updateOne(
        { _id: orderId, status: OrderStatus.SEARCHING_DRIVER },
        {
          $set: {
            currentOffer: {
              driverUserId: currentCandidate.driverUserId,
              driverId: currentCandidate.driverId,
              offeredAt,
              expiresAt,
              payload: payloadWithTimer,
            },
          },
        }
      );
    } catch (err: any) {
      console.warn(`[DISPATCH MANAGER] Failed to persist offer for order ${orderId}:`, err.message);
    }

    socketManager.emitToDriver(currentCandidate.driverUserId, "new_order", payloadWithTimer, "DispatchManager.offerNextDriver");

    // 2. Send Push Notification to this specific driver
    (async () => {
      try {
        const earnings = session.orderPayload.earnings || 0;
        await NotificationService.getInstance().sendNotification({
          userId: currentCandidate.driverUserId,
          title: "New Order Offer Nearby! 🚖",
          body: `Earn ~₹${earnings}. Tap to view order details before time expires!`,
          data: {
            orderId: orderId,
            type: "NEW_ORDER_OFFER",
            deepLink: { screen: "/(tabs)", params: { orderId: orderId.toString() } },
          },
        });
      } catch (pErr: any) {
        console.warn(`[DISPATCH MANAGER] Failed to send push notification to driverUser ${currentCandidate.driverUserId}:`, pErr.message);
      }
    })();

    // 3. Set fallback server timer (OFFER_TIMEOUT_MS) for timeout cascade
    session.timer = setTimeout(async () => {
      console.log(`⏰ [DISPATCH TIMEOUT] Driver ${currentCandidate.driverUserId} did not accept order ${orderId} within ${this.OFFER_TIMEOUT_SECONDS}s.`);
      await this.clearOffer(orderId, currentCandidate.driverUserId);

      // Revoke offer from driver screen via socket
      socketManager.emitToDriver(currentCandidate.driverUserId, "order_offer_expired", { orderId }, "DispatchManager.timeout");

      // Mark driver as declined for this order session
      await this.recordDeclineInDb(orderId, currentCandidate.driverUserId, "Offer timeout (No response)");
      session.declinedDriverUserIds.add(currentCandidate.driverUserId);
      session.currentIndex++;

      // Offer to next driver in sequence
      await this.offerNextDriver(orderId);
    }, this.OFFER_TIMEOUT_MS);
  }

  /**
   * Handle when a driver accepts the order
   */
  public handleDriverAccept(orderId: string, driverUserId: string): boolean {
    // Even with no in-memory session (another instance, or a restart), the persisted offer goes.
    void this.clearOffer(orderId);
    const session = this.activeDispatches.get(orderId);
    if (!session) return true; // Order may not be tracked in active dispatch

    const currentCandidate = session.candidates[session.currentIndex];

    // Verify driver is the active candidate
    if (currentCandidate && currentCandidate.driverUserId !== driverUserId) {
      console.warn(`[DISPATCH MANAGER] Driver ${driverUserId} attempted to accept order ${orderId}, but active candidate is ${currentCandidate.driverUserId}`);
    }

    if (session.timer) {
      clearTimeout(session.timer);
    }
    this.activeDispatches.delete(orderId);
    console.log(`✅ [DISPATCH SUCCESS] Order ${orderId} accepted by driver ${driverUserId}`);
    return true;
  }

  /**
   * Handle when a driver declines the order
   */
  public async handleDriverDecline(orderId: string, driverUserId: string): Promise<boolean> {
    // Withdrawn even without a session here, so the decliner's next poll doesn't show it again.
    await this.clearOffer(orderId, driverUserId);
    const session = this.activeDispatches.get(orderId);
    if (!session) return false;

    console.log(`🛑 [DISPATCH DECLINE] Driver ${driverUserId} explicitly declined order ${orderId}`);

    if (session.timer) {
      clearTimeout(session.timer);
      session.timer = undefined;
    }

    // Revoke offer from driver screen
    const socketManager = SocketManager.getInstance();
    socketManager.emitToDriver(driverUserId, "order_offer_expired", { orderId }, "DispatchManager.decline");

    await this.recordDeclineInDb(orderId, driverUserId, "Explicitly declined by helper/driver");
    session.declinedDriverUserIds.add(driverUserId);
    session.currentIndex++;

    // Immediately offer to next driver
    await this.offerNextDriver(orderId);
    return true;
  }

  /**
   * Handle when customer cancels order while dispatching
   */
  public handleCustomerCancel(orderId: string): void {
    void this.clearOffer(orderId);
    const session = this.activeDispatches.get(orderId);
    if (!session) return;

    if (session.timer) {
      clearTimeout(session.timer);
    }

    const currentCandidate = session.candidates[session.currentIndex];
    if (currentCandidate) {
      const socketManager = SocketManager.getInstance();
      socketManager.emitToDriver(currentCandidate.driverUserId, "order_cancelled", { orderId }, "DispatchManager.customerCancel");
    }

    this.activeDispatches.delete(orderId);
    console.log(`🚫 [DISPATCH CANCELLED] Dispatch sequence cancelled for order ${orderId}`);
  }

  /**
   * Check which driver is currently being offered the order
   */
  public getCurrentOfferedDriverUserId(orderId: string): string | null {
    const session = this.activeDispatches.get(orderId);
    if (!session) return null;
    const current = session.candidates[session.currentIndex];
    return current ? current.driverUserId : null;
  }

  /**
   * Helper to notify customer when no drivers are available
   */
  private notifyNoDriversAvailable(orderId: string, customerUserId?: string) {
    if (!customerUserId) return;
    try {
      const socketManager = SocketManager.getInstance();
      socketManager.emitToUser(customerUserId, "no_drivers_available", {
        orderId,
        message: "No drivers available near your location right now. Please try again in a few moments.",
      }, "DispatchManager.noDrivers");
    } catch (e) {
      console.warn("[DISPATCH MANAGER] Failed to emit no_drivers_available:", e);
    }
  }

  /**
   * Cancel and clean up an order dispatch
   */
  public cancelDispatch(orderId: string): void {
    const session = this.activeDispatches.get(orderId);
    if (session) {
      if (session.timer) clearTimeout(session.timer);
      this.activeDispatches.delete(orderId);
    }
  }

  /**
   * Withdraw the persisted offer. With a driverUserId, only that driver's offer is
   * removed, so a slow write can't wipe the next driver's freshly made offer.
   */
  private async clearOffer(orderId: string, driverUserId?: string) {
    const filter: any = { _id: orderId };
    if (driverUserId) filter["currentOffer.driverUserId"] = driverUserId;
    try {
      await Order.updateOne(filter, { $unset: { currentOffer: 1 } });
    } catch (err: any) {
      console.warn(`[DISPATCH MANAGER] Failed to clear offer for order ${orderId}:`, err.message);
    }
  }

  /** The search found nobody: recorded so a polling customer app can show it. */
  private async markExhausted(orderId: string) {
    try {
      await Order.updateOne({ _id: orderId }, { $set: { dispatchExhaustedAt: new Date() }, $unset: { currentOffer: 1 } });
    } catch (err: any) {
      console.warn(`[DISPATCH MANAGER] Failed to mark dispatch exhausted for order ${orderId}:`, err.message);
    }
  }

  private async recordDeclineInDb(orderId: string, driverUserId: string, reason: string) {
    try {
      const driver = await Driver.findOne({ user: driverUserId });
      if (driver) {
        const order = await Order.findById(orderId);
        if (order) {
          if (!order.declineReasons) {
            order.declineReasons = [];
          }
          const alreadyDeclined = order.declineReasons.some(r => r.driverId === driver._id.toString());
          if (!alreadyDeclined) {
            order.declineReasons.push({ driverId: driver._id.toString(), reason });
            await order.save();
            console.log(`[DISPATCH MANAGER] Decline recorded in DB for order ${orderId} by driver ${driverUserId}`);
          }
        }
      }
    } catch (err: any) {
      console.error(`[DISPATCH MANAGER] Failed to record decline in DB:`, err.message);
    }
  }
}

export const dispatchManager = DispatchManagerService.getInstance();
