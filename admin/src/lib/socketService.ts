import { io, Socket } from "socket.io-client";
import { BASE_URL } from "./api-client";

const SOCKET_URL = BASE_URL.replace("/api/v1", "");

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private lastJoin: { userId: string; role: string } | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect() {
    if (this.socket) return;

    const token =
      localStorage.getItem("admin_token") ||
      localStorage.getItem("vendor_token") ||
      localStorage.getItem("support_token");
    console.log(`[Vendor Socket] Connecting to ${SOCKET_URL}/ws/v1/socket.io`);

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      path: "/ws/v1/socket.io",
      auth: token ? { token } : undefined,
    });

    this.socket.on("connect", () => {
      console.log("Connected to Real-time Hub (Vendor)");
      // A dropped connection (network blip, tab backgrounded) gets a brand new
      // socket.io handshake on reconnect, which starts back in no room at all —
      // nothing re-sent "join" for it. A vendor sitting on the dashboard waiting
      // for orders would silently stop receiving new_order_vendor after that,
      // with no sound and no error to notice by. Re-join whatever room the last
      // successful join asked for.
      if (this.lastJoin) {
        this.socket?.emit("join", this.lastJoin);
        console.log(`[Vendor Socket] Re-joined room after reconnect: userId=${this.lastJoin.userId}, role=${this.lastJoin.role}`);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from Real-time Hub (Vendor)");
    });

    this.socket.on("connect_error", (error) => {
      console.error(`[Vendor Socket] Connection failed: ${error.message}`);
    });
  }

  public join(userId: string, role: string = "VENDOR") {
    if (!this.socket) this.connect();
    this.lastJoin = { userId, role };
    this.socket?.emit("join", { userId, role });
    console.log(`[Vendor Socket] Join room requested: userId=${userId}, role=${role}`);
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  public emit(event: string, data: any) {
    if (!this.socket) this.connect();
    this.socket?.emit(event, data);
  }

  public off(event: string, callback: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  public disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.lastJoin = null;
  }
}

export const socketService = SocketService.getInstance();
