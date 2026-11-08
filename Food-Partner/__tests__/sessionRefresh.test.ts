const api = "https://api.test/api/v1";

type Call = { url: string; auth: string | null };

// Loaded fresh per test: the module captures globalThis.fetch when it is first imported.
function setup(responder: (call: Call, n: number) => Response | Promise<Response>) {
  const calls: Call[] = [];
  globalThis.fetch = jest.fn(async (input: any, init?: RequestInit) => {
    const call = { url: String(input), auth: new Headers(init?.headers).get("authorization") };
    calls.push(call);
    return responder(call, calls.length);
  }) as any;
  let tokens = { token: "old", refreshToken: "r1" };
  const mod = require("@/utils/api/sessionRefresh") as typeof import("@/utils/api/sessionRefresh");
  mod.configureSessionRefresh({
    apiUrl: api,
    getToken: () => tokens.token,
    getRefreshToken: () => tokens.refreshToken,
    onTokens: (t) => {
      tokens = t;
    },
  });
  return { calls, tokens: () => tokens };
}

const json = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status });

beforeEach(() => jest.resetModules());

it("renews once and repeats the call after a 401", async () => {
  const { calls, tokens } = setup((c) => {
    if (c.url.endsWith("/auth/refresh")) return json(200, { token: "new", refreshToken: "r2" });
    return c.auth === "Bearer new" ? json(200, { ok: true }) : json(401);
  });
  const res = await fetch(`${api}/orders`, { headers: { authorization: "Bearer old" } });
  expect(res.status).toBe(200);
  expect(tokens()).toEqual({ token: "new", refreshToken: "r2" });
  expect(calls.map((c) => c.url.replace(api, ""))).toEqual(["/orders", "/auth/refresh", "/orders"]);
});

it("shares one refresh between parallel 401s", async () => {
  const { calls } = setup((c) => {
    if (c.url.endsWith("/auth/refresh")) return json(200, { token: "new", refreshToken: "r2" });
    return c.auth === "Bearer new" ? json(200) : json(401);
  });
  await Promise.all([1, 2, 3].map((i) => fetch(`${api}/o${i}`, { headers: { authorization: "Bearer old" } })));
  expect(calls.filter((c) => c.url.endsWith("/auth/refresh"))).toHaveLength(1);
});

it("passes the 401 through when the server rejects the refresh token", async () => {
  const { calls } = setup((c) => json(401));
  const res = await fetch(`${api}/orders`, { headers: { authorization: "Bearer old" } });
  expect(res.status).toBe(401);
  expect(calls).toHaveLength(2);
});

it("does not treat a server error on refresh as a sign-out", async () => {
  setup((c) => (c.url.endsWith("/auth/refresh") ? json(503) : json(401)));
  await expect(fetch(`${api}/orders`, { headers: { authorization: "Bearer old" } })).rejects.toThrow();
});

it("leaves sign-in and calls without a token alone", async () => {
  const { calls } = setup(() => json(401));
  expect((await fetch(`${api}/auth/login-password`, { headers: { authorization: "Bearer old" } })).status).toBe(401);
  expect((await fetch(`${api}/vendors/login`, {})).status).toBe(401);
  expect(calls).toHaveLength(2);
});
