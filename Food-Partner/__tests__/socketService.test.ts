import { io } from "socket.io-client";

// Sockets are off unless EXPO_PUBLIC_ENABLE_SOCKETS is "true", read when the
// module loads — so it is set before the module is required, not imported.
process.env.EXPO_PUBLIC_ENABLE_SOCKETS = "true";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { socketService } = require("@/utils/socketService") as typeof import("@/utils/socketService");

type Handler = (...args: unknown[]) => void;

const mockSockets: { handlers: Record<string, Handler[]>; on: jest.Mock; off: jest.Mock; emit: jest.Mock; removeAllListeners: jest.Mock; disconnect: jest.Mock }[] = [];

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => {
    const handlers: Record<string, Handler[]> = {};
    const socket = {
      handlers,
      on: jest.fn((event: string, cb: Handler) => {
        (handlers[event] ??= []).push(cb);
      }),
      off: jest.fn(),
      emit: jest.fn(),
      removeAllListeners: jest.fn(),
      disconnect: jest.fn(),
    };
    mockSockets.push(socket);
    return socket;
  }),
}));
jest.mock("@/utils/env", () => ({ env: {}, socketBaseUrl: "https://api.example.test" }));

const latest = () => mockSockets[mockSockets.length - 1];
const fire = (event: string, ...args: unknown[]) => latest().handlers[event]?.forEach((cb) => cb(...args));

beforeEach(() => {
  socketService.disconnect();
  mockSockets.length = 0;
  (io as jest.Mock).mockClear();
});

describe("socketService", () => {
  it("re-joins the outlet's room after every reconnect, so alerts never silently stop", () => {
    socketService.connect("jwt-1");
    socketService.join("v1", "VENDOR");
    latest().emit.mockClear();

    fire("connect"); // a reconnect starts in no room at all
    expect(latest().emit).toHaveBeenCalledWith("join", { userId: "v1", role: "VENDOR" });
  });

  it("attaches listeners registered before the connection existed", () => {
    const onOrder = jest.fn();
    socketService.on("new_order_vendor", onOrder);
    socketService.connect("jwt-1");
    fire("new_order_vendor", { id: "o1" });
    expect(onOrder).toHaveBeenCalledWith({ id: "o1" });
    socketService.off("new_order_vendor", onOrder);
  });

  it("keeps one connection per token and replaces it when the token changes", () => {
    socketService.connect("jwt-1");
    socketService.connect("jwt-1");
    expect(io).toHaveBeenCalledTimes(1);

    const first = latest();
    socketService.connect("jwt-2");
    expect(io).toHaveBeenCalledTimes(2);
    expect(first.disconnect).toHaveBeenCalled();
    expect((io as jest.Mock).mock.calls[1][1]).toMatchObject({ auth: { token: "jwt-2" }, path: "/ws/v1/socket.io" });
  });

  it("forgets the room on sign-out", () => {
    socketService.connect("jwt-1");
    socketService.join("v1");
    socketService.disconnect();

    socketService.connect("jwt-2");
    fire("connect");
    expect(latest().emit).not.toHaveBeenCalled();
  });
});

describe("socketService with sockets disabled", () => {
  it("never opens a connection or emits a join", () => {
    process.env.EXPO_PUBLIC_ENABLE_SOCKETS = "";
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { socketService: disabled } = require("@/utils/socketService") as typeof import("@/utils/socketService");
      disabled.connect("jwt-1");
      disabled.join("v1", "VENDOR");
      disabled.on("new_order_vendor", jest.fn());
    });
    process.env.EXPO_PUBLIC_ENABLE_SOCKETS = "true";
    expect(io).not.toHaveBeenCalled();
  });
});
