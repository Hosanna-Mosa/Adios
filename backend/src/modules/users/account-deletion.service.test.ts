import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import User, { UserRole } from "../../database/models/User";
import Driver from "../../database/models/Driver";
import Order from "../../database/models/Order";
import Cart from "../../database/models/Cart";
import DriverPayout from "../../database/models/DriverPayout";
import cloudinary from "../../utils/cloudinary";
import { cloudinaryPublicId, deleteOwnAccount, DELETED_USER_NAME } from "./account-deletion.service";

// No database: the model calls the service makes are stubbed, and what it
// writes is captured.
const originals: Array<[any, string, any]> = [];
const stub = (target: any, key: string, impl: any) => {
  originals.push([target, key, target[key]]);
  target[key] = impl;
};

let userUpdate: any;
let driverUpdate: any;
let destroyed: string[];

const customer = (overrides: Record<string, unknown> = {}) => ({
  _id: "64a000000000000000000001",
  role: UserRole.USER,
  password: "$2b$10$hash",
  tokenVersion: 2,
  profilePic: "https://res.cloudinary.com/demo/image/upload/v1712/profile_pics/abc123.jpg",
  matchPassword: async (p: string) => p === "right-password",
  ...overrides,
});

const setup = (opts: { user: any; driver?: any; activeOrder?: boolean; pendingPayout?: boolean }) => {
  stub(User, "findById", async () => opts.user);
  stub(User, "updateOne", async (_q: any, update: any) => {
    userUpdate = update;
  });
  stub(Driver, "findOne", async () => opts.driver ?? null);
  stub(Driver, "updateOne", async (_q: any, update: any) => {
    driverUpdate = update;
  });
  stub(Order, "exists", async () => (opts.activeOrder ? { _id: "o1" } : null));
  stub(DriverPayout, "exists", async () => (opts.pendingPayout ? { _id: "p1" } : null));
  stub(Cart, "deleteOne", async () => ({}));
  stub(cloudinary.uploader, "destroy", async (id: string) => {
    destroyed.push(id);
  });
};

beforeEach(() => {
  userUpdate = undefined;
  driverUpdate = undefined;
  destroyed = [];
});
afterEach(() => {
  while (originals.length) {
    const [target, key, value] = originals.pop()!;
    target[key] = value;
  }
});

test("anonymises a customer: identity cleared, sessions ended, phone released", async () => {
  setup({ user: customer() });
  await deleteOwnAccount("64a000000000000000000001", "right-password");

  assert.equal(userUpdate.$set.name, DELETED_USER_NAME);
  assert.equal(userUpdate.$set.phone, "deleted-64a000000000000000000001");
  assert.equal(userUpdate.$set.tokenVersion, 3);
  assert.equal(userUpdate.$set.isBlocked, true);
  assert.ok(userUpdate.$set.deletedAt instanceof Date);
  assert.deepEqual(userUpdate.$set.addresses, []);
  for (const field of ["email", "username", "password", "profilePic", "expoPushToken"]) {
    assert.equal(userUpdate.$unset[field], 1, `${field} should be removed`);
  }
  assert.deepEqual(destroyed, ["profile_pics/abc123"]);
});

test("a wrong or missing password changes nothing", async () => {
  setup({ user: customer() });
  await assert.rejects(deleteOwnAccount("u1", "wrong"), (err: any) => err.code === "PASSWORD_INCORRECT" && err.statusCode === 403);
  await assert.rejects(deleteOwnAccount("u1", undefined), (err: any) => err.code === "PASSWORD_INCORRECT");
  assert.equal(userUpdate, undefined);
});

test("refuses while an order is in progress", async () => {
  setup({ user: customer(), activeOrder: true });
  await assert.rejects(deleteOwnAccount("u1", "right-password"), (err: any) => err.code === "ACTIVE_ORDER" && err.statusCode === 409);
  assert.equal(userUpdate, undefined);
});

test("refuses staff accounts", async () => {
  setup({ user: customer({ role: UserRole.ADMIN }) });
  await assert.rejects(deleteOwnAccount("u1", "right-password"), (err: any) => err.statusCode === 403);
});

test("a driver's KYC, bank details and document photos are removed too", async () => {
  const driver = {
    _id: "d1",
    panImage: "https://res.cloudinary.com/demo/image/upload/v1/kyc/pan.png",
    selfieImage: "https://res.cloudinary.com/demo/image/upload/kyc/selfie.jpg",
  };
  setup({ user: customer({ role: UserRole.DRIVER, profilePic: undefined }), driver });
  await deleteOwnAccount("u1", "right-password");

  for (const field of ["aadhaarNumber", "panNumber", "dlNumber", "bankAccountNumber", "bankIfsc", "selfieImage"]) {
    assert.equal(driverUpdate.$unset[field], 1, `${field} should be removed`);
  }
  assert.deepEqual(driverUpdate.$set.bankAccounts, []);
  assert.deepEqual(destroyed.sort(), ["kyc/pan", "kyc/selfie"]);
});

test("a driver with a payout still in flight must wait", async () => {
  setup({ user: customer({ role: UserRole.DRIVER }), driver: { _id: "d1" }, pendingPayout: true });
  await assert.rejects(deleteOwnAccount("u1", "right-password"), (err: any) => err.code === "PAYOUT_PENDING");
  assert.equal(driverUpdate, undefined);
});

test("cloudinaryPublicId reads the id from upload URLs and ignores anything else", () => {
  assert.equal(cloudinaryPublicId("https://res.cloudinary.com/x/image/upload/v1712/profile_pics/a.jpg"), "profile_pics/a");
  assert.equal(cloudinaryPublicId("https://res.cloudinary.com/x/image/upload/c_fill,w_200/v3/folder/b.png"), "folder/b");
  assert.equal(cloudinaryPublicId("https://images.unsplash.com/photo.jpg"), null);
  assert.equal(cloudinaryPublicId(undefined), null);
});
