import { test, afterEach } from "node:test";
import assert from "node:assert/strict";

import { getAllowedOrigins, getTrustProxy, isDevEnv } from "./env";

const saved = { ...process.env };
afterEach(() => {
  for (const key of ["NODE_ENV", "ALLOWED_ORIGINS", "TRUST_PROXY"]) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

const set = (vars: Record<string, string | undefined>) => {
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
};

test("only an explicit development/test NODE_ENV counts as dev", () => {
  set({ NODE_ENV: "development" });
  assert.equal(isDevEnv(), true);
  set({ NODE_ENV: "test" });
  assert.equal(isDevEnv(), true);
  set({ NODE_ENV: "production" });
  assert.equal(isDevEnv(), false);
  set({ NODE_ENV: undefined });
  assert.equal(isDevEnv(), false);
});

test("ALLOWED_ORIGINS is parsed into a trimmed list", () => {
  set({ NODE_ENV: "production", ALLOWED_ORIGINS: " https://a.example.com , https://b.example.com ,," });
  assert.deepEqual(getAllowedOrigins(), ["https://a.example.com", "https://b.example.com"]);
});

test("unset ALLOWED_ORIGINS allows any origin on a dev box and refuses to boot elsewhere", () => {
  set({ NODE_ENV: "development", ALLOWED_ORIGINS: undefined });
  assert.equal(getAllowedOrigins(), "*");
  set({ NODE_ENV: "production", ALLOWED_ORIGINS: undefined });
  assert.throws(() => getAllowedOrigins(), /ALLOWED_ORIGINS/);
  set({ NODE_ENV: undefined, ALLOWED_ORIGINS: "" });
  assert.throws(() => getAllowedOrigins(), /ALLOWED_ORIGINS/);
});

test("TRUST_PROXY: unset is off, hop counts are numbers, named forms pass through, true is refused", () => {
  set({ TRUST_PROXY: undefined });
  assert.equal(getTrustProxy(), undefined);
  set({ TRUST_PROXY: "false" });
  assert.equal(getTrustProxy(), undefined);
  set({ TRUST_PROXY: "1" });
  assert.equal(getTrustProxy(), 1);
  set({ TRUST_PROXY: "loopback" });
  assert.equal(getTrustProxy(), "loopback");
  set({ TRUST_PROXY: "true" });
  assert.throws(() => getTrustProxy(), /hop count/);
});
