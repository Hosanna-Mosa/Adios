import { test } from "node:test";
import assert from "node:assert/strict";
import mongoose, { Schema } from "mongoose";
import { decryptJson, encryptedFields, encryptJson, mapEncryptedPaths } from "./encryptedFields";
import {
  decryptField,
  encryptField,
  isEncrypted,
  resetFieldEncryptionKeys,
} from "../../utils/fieldCrypto";

const KEY_A = "a".repeat(64);
const KEY_B = "b".repeat(64);

function useKeys(env: Record<string, string | undefined>) {
  for (const k of ["DATA_ENCRYPTION_KEY", "DATA_ENCRYPTION_KEY_ID", "DATA_ENCRYPTION_OLD_KEYS"]) delete process.env[k];
  Object.assign(process.env, env);
  resetFieldEncryptionKeys();
}

useKeys({ DATA_ENCRYPTION_KEY: KEY_A });

const PATHS = ["pan", "bankAccounts.accountNumber", "bankAccounts.ifsc"];
const TestSchema = new Schema(
  {
    name: String,
    pan: String,
    bankAccounts: [{ accountNumber: String, ifsc: String, verified: Boolean }],
  },
  { timestamps: true }
);
TestSchema.plugin(encryptedFields, { paths: PATHS });
const Model = mongoose.model("EncPluginTest", TestSchema);

test("encryptField round-trips and never double-encrypts", () => {
  const enc = encryptField("ABCDE1234F") as string;
  assert.ok(isEncrypted(enc));
  assert.notEqual(enc, "ABCDE1234F");
  assert.equal(encryptField(enc), enc);
  assert.equal(decryptField(enc), "ABCDE1234F");
  assert.notEqual(encryptField("ABCDE1234F"), enc, "random IV: same input gives different ciphertext");
});

test("empty and non-string values pass through", () => {
  assert.equal(encryptField(""), "");
  assert.equal(encryptField(undefined), undefined);
  assert.equal(encryptField(null), null);
  assert.equal(decryptField("plain legacy value"), "plain legacy value");
});

test("tampered, wrong-key and unknown-key values throw instead of returning empty", () => {
  const enc = encryptField("secret") as string;
  const parts = enc.split(":");
  parts[4] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => decryptField(parts.join(":")));
  assert.throws(() => decryptField("enc:1:bad"));

  const swappedId = enc.replace("enc:1:", "enc:2:");
  useKeys({ DATA_ENCRYPTION_KEY: KEY_A, DATA_ENCRYPTION_OLD_KEYS: `2:${KEY_B}` });
  assert.throws(() => decryptField(swappedId), "key id is authenticated");

  useKeys({ DATA_ENCRYPTION_KEY: KEY_B });
  assert.throws(() => decryptField(enc), /No encryption key|Could not decrypt/);
  useKeys({ DATA_ENCRYPTION_KEY: KEY_A });
});

test("key rotation: old key still decrypts, new writes use the new key id", () => {
  const old = encryptField("12345") as string;
  useKeys({ DATA_ENCRYPTION_KEY: KEY_B, DATA_ENCRYPTION_KEY_ID: "2", DATA_ENCRYPTION_OLD_KEYS: `1:${KEY_A}` });
  assert.equal(decryptField(old), "12345");
  assert.ok((encryptField("12345") as string).startsWith("enc:2:"));
  useKeys({ DATA_ENCRYPTION_KEY: KEY_A });
});

test("missing or malformed key fails loudly", () => {
  useKeys({});
  assert.throws(() => encryptField("x"), /DATA_ENCRYPTION_KEY is not set/);
  useKeys({ DATA_ENCRYPTION_KEY: "tooshort" });
  assert.throws(() => encryptField("x"), /32 bytes/);
  useKeys({ DATA_ENCRYPTION_KEY: KEY_A });
});

test("document stores ciphertext, code sees plain text, JSON is plain", () => {
  const doc = new Model({
    name: "Ravi",
    pan: "ABCDE1234F",
    bankAccounts: [{ accountNumber: "111122223333", ifsc: "HDFC0001234", verified: true }],
  });

  assert.equal(doc.pan, "ABCDE1234F");
  assert.equal(doc.bankAccounts[0].accountNumber, "111122223333");

  const stored = doc.get("pan", null, { getters: false }) as string;
  assert.ok(isEncrypted(stored), "stored value is encrypted");
  assert.ok(isEncrypted(doc.bankAccounts[0].get("accountNumber", null, { getters: false }) as string));

  const json = doc.toJSON() as any;
  assert.equal(json.pan, "ABCDE1234F");
  assert.equal(json.bankAccounts[0].accountNumber, "111122223333");
  assert.equal(json.bankAccounts[0].ifsc, "HDFC0001234");
  assert.equal(json.bankAccounts[0].verified, true, "other subdocument fields untouched");
  assert.equal("id" in json, false, "no virtuals leaked into the response");
  assert.equal((doc.toObject() as any).pan, "ABCDE1234F");
  assert.equal(JSON.parse(JSON.stringify(doc)).pan, "ABCDE1234F");
});

test("a subdocument or subdocument array serialized on its own is decrypted too", () => {
  const doc = new Model({ name: "x", bankAccounts: [{ accountNumber: "111122223333", ifsc: "HDFC0001234" }] });
  const arr = JSON.parse(JSON.stringify(doc.bankAccounts));
  assert.equal(arr[0].accountNumber, "111122223333");
  assert.equal(arr[0].ifsc, "HDFC0001234");
  assert.equal((doc.bankAccounts[0] as any).toJSON().accountNumber, "111122223333");
  assert.equal((doc.bankAccounts[0] as any).toObject().ifsc, "HDFC0001234");
});

test("pushing and editing subdocuments encrypts them", () => {
  const doc = new Model({ name: "x" });
  doc.bankAccounts.push({ accountNumber: "999", ifsc: "SBIN0000001", verified: false } as any);
  assert.ok(isEncrypted(doc.bankAccounts[0].get("ifsc", null, { getters: false }) as string));
  doc.pan = "NEWPAN1234Z";
  assert.equal(doc.pan, "NEWPAN1234Z");
  assert.ok(isEncrypted(doc.get("pan", null, { getters: false }) as string));
});

test("legacy plain values read as they are", () => {
  const doc = Model.hydrate({ _id: new mongoose.Types.ObjectId(), pan: "PLAINPAN", bankAccounts: [{ accountNumber: "42" }] });
  assert.equal(doc.pan, "PLAINPAN");
  assert.equal(doc.bankAccounts[0].accountNumber, "42");
});

test("update operators encrypt $set values", () => {
  const update = Model.updateOne({}, { $set: { pan: "UPDPAN1234" } }).getUpdate() as any;
  const q = Model.updateOne({}, { $set: { pan: "UPDPAN1234" } });
  (q as any)._castUpdate((q as any)._update);
  const set = (q as any)._update.$set;
  assert.ok(isEncrypted(set.pan), "update stores ciphertext");
  assert.ok(update);
});

test("mapEncryptedPaths decrypts lean-shaped results, including arrays", () => {
  const lean = {
    pan: encryptField("LEANPAN123"),
    bankAccounts: [{ accountNumber: encryptField("1"), ifsc: "legacy-plain", verified: true }],
  };
  mapEncryptedPaths(lean, PATHS, decryptField);
  assert.equal(lean.pan, "LEANPAN123");
  assert.equal(lean.bankAccounts[0].accountNumber, "1");
  assert.equal(lean.bankAccounts[0].ifsc, "legacy-plain");
  mapEncryptedPaths({}, PATHS, decryptField);
  mapEncryptedPaths({ bankAccounts: null }, PATHS, decryptField);
});

test("a path missing from the schema is rejected at definition time", () => {
  assert.throws(() => new Schema({ a: String }).plugin(encryptedFields, { paths: ["nope"] }), /not in the schema/);
});

const JsonSchema = new Schema({ note: String, orderData: Schema.Types.Mixed }, { timestamps: true });
JsonSchema.plugin(encryptedFields, { paths: ["note"], jsonPaths: ["orderData"] });
const JsonModel = mongoose.model("EncJsonPluginTest", JsonSchema);

test("jsonPaths: whole object is stored encrypted, read back with Dates and ObjectIds intact", () => {
  const when = new Date("2026-10-25T10:00:00Z");
  const vendorId = new mongoose.Types.ObjectId();
  const data = { stops: [{ address: "12 MG Road", location: { coordinates: [78.4, 17.4] } }], vendorId, when, total: 249.5, flag: true, none: null };
  const doc = new JsonModel({ note: "n", orderData: data });

  assert.ok(isEncrypted(doc.get("orderData", null, { getters: false }) as string));
  const out = doc.orderData as any;
  assert.equal(out.stops[0].address, "12 MG Road");
  assert.equal(out.total, 249.5);
  assert.ok(out.when instanceof Date && out.when.getTime() === when.getTime());
  assert.equal(String(out.vendorId), String(vendorId));
  assert.equal(out.none, null);
  assert.equal((doc.toJSON() as any).orderData.stops[0].address, "12 MG Road");
});

test("jsonPaths: legacy plain objects read as they are; strings and empties pass through", () => {
  const legacy = JsonModel.hydrate({ _id: new mongoose.Types.ObjectId(), orderData: { stops: [1] } });
  assert.deepEqual(legacy.orderData, { stops: [1] });
  assert.equal(encryptJson(undefined), undefined);
  assert.equal(encryptJson(null), null);
  assert.equal(decryptJson("plain"), "plain");
  const enc = encryptJson({ a: 1 }) as string;
  assert.equal(encryptJson(enc), enc, "an encrypted blob is never encrypted twice");
  assert.deepEqual(decryptJson(enc), { a: 1 });
});

test("jsonPaths: updates and lean results", () => {
  const q = JsonModel.updateOne({}, { $set: { orderData: { a: 1 }, note: "x" } });
  (q as any)._castUpdate((q as any)._update);
  const set = (q as any)._update.$set;
  assert.ok(isEncrypted(set.orderData) && isEncrypted(set.note));

  const lean = { orderData: encryptJson({ stops: [{ address: "a" }] }), note: encryptField("n") };
  mapEncryptedPaths(lean, ["note"], decryptField);
  mapEncryptedPaths(lean, ["orderData"], decryptJson);
  assert.equal(lean.note, "n");
  assert.deepEqual(lean.orderData, { stops: [{ address: "a" }] });
});
