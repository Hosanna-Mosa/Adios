import { test, afterEach } from "node:test";
import assert from "node:assert/strict";

import { isDummyOtpEnabled } from "./auth.config";

const original = { NODE_ENV: process.env.NODE_ENV, ALLOW_DUMMY_OTP: process.env.ALLOW_DUMMY_OTP };

function setEnv(nodeEnv: string | undefined, allow: string | undefined) {
  if (nodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = nodeEnv;
  if (allow === undefined) delete process.env.ALLOW_DUMMY_OTP;
  else process.env.ALLOW_DUMMY_OTP = allow;
}

afterEach(() => setEnv(original.NODE_ENV, original.ALLOW_DUMMY_OTP));

test("dummy OTP runs in development and test", () => {
  setEnv("development", undefined);
  assert.equal(isDummyOtpEnabled(), true);
  setEnv("test", undefined);
  assert.equal(isDummyOtpEnabled(), true);
});

test("dummy OTP is off in production and when NODE_ENV is unset", () => {
  setEnv("production", undefined);
  assert.equal(isDummyOtpEnabled(), false);
  setEnv(undefined, undefined);
  assert.equal(isDummyOtpEnabled(), false);
  setEnv("production", "false");
  assert.equal(isDummyOtpEnabled(), false);
});

test("ALLOW_DUMMY_OTP=true forces it on, and only the exact value does", () => {
  setEnv("production", "true");
  assert.equal(isDummyOtpEnabled(), true);
  setEnv("production", "1");
  assert.equal(isDummyOtpEnabled(), false);
});
