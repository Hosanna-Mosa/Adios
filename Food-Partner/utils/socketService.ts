import { io, Socket } from "socket.io-client";
import { socketBaseUrl } from "@/utils/env";

// One Socket.IO connection for the partner session — the mobile twin of
// admin/src/lib/socketService.ts that the web vendor panel uses, joining the
// same "VENDOR" room so the backend's new_order_vendor /
// order_status_update_vendor / scheduled_delivery_request / ticket_updated
// events reach this device exactly as they reach the panel.

type Listener = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private lastJoin: { userId: string; role: string } | null = null;
  // Listeners are kept here as well as on the socket, so a screen may subscribe
  // before the connection exists (or across a reconnect with a new token) and
  // still be attached to whichever socket is live.
  private listeners = new Map<string, Set<Listener>>();

  /** Opens the connection with this session's token. A different token reconnects. */
  public connect(token: string) {
    if (this.socket && this.token === token) return;
    this.closeSocket();
    this.token = token;

    const socket = io(socketBaseUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      path: "/ws/v1/socket.io",
      auth: { token },
    });
    this.socket = socket;

    socket.on("connect", () => {
      // A reconnect is a brand-new handshake that starts in no room at all, so a
      // partner left on the dashboard would silently stop hearing about orders.
      // Re-join whatever room the last join asked for.
      if (this.lastJoin) socket.emit("join", this.lastJoin);
    });
    socket.on("connect_error", (error) => {
      console.warn(`[Partner Socket] Connection failed: ${error.message}`);
    });

    this.listeners.forEach((callbacks, event) => callbacks.forEach((cb) => socket.on(event, cb)));
  }

  public join(userId: string, role = "VENDOR") {
    this.lastJoin = { userId, role };
    this.socket?.emit("join", this.lastJoin);
  }

  public on(event: string, callback: Listener) {
    const callbacks = this.listeners.get(event) ?? new Set<Listener>();
    callbacks.add(callback);
    this.listeners.set(event, callbacks);
    this.socket?.on(event, callback);
  }

  public off(event: string, callback: Listener) {
    this.listeners.get(event)?.delete(callback);
    this.socket?.off(event, callback);
  }

  /** Ends the session's connection. Subscriptions stay registered for the next one. */
  public disconnect() {
    this.closeSocket();
    this.token = null;
    this.lastJoin = null;
  }

  private closeSocket() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
