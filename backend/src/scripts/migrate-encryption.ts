import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Driver from "../database/models/Driver";
import Vendor from "../database/models/Vendor";
import Payment from "../database/models/Payment";
import DriverPayout from "../database/models/DriverPayout";
import VendorPayout from "../database/models/VendorPayout";
import Order from "../database/models/Order";
import User from "../database/models/User";
import ChatMessage from "../database/models/ChatMessage";
import SupportTicket from "../database/models/SupportTicket";
import SupportBotQuery from "../database/models/SupportBotQuery";
import Notification from "../database/models/Notification";
import Review from "../database/models/Review";
import { decryptJson, encryptJson, getEncryptedFields } from "../database/plugins/encryptedFields";
import { assertFieldEncryptionConfigured, decryptField, encryptField } from "../utils/fieldCrypto";

dotenv.config();

/**
 * Encrypts (or decrypts) the fields declared with the `encryptedFields` plugin on existing documents.
 *
 *   npx ts-node src/scripts/migrate-encryption.ts all                    # dry run (default): counts only
 *   npx ts-node src/scripts/migrate-encryption.ts all --apply            # encrypt
 *   npx ts-node src/scripts/migrate-encryption.ts Driver Vendor --apply  # only these models
 *   npx ts-node src/scripts/migrate-encryption.ts all --rollback --apply # decrypt everything back
 *   add --rotate with --apply to re-encrypt values under the current DATA_ENCRYPTION_KEY
 *
 * Take a database backup first. Safe to re-run: values already encrypted are skipped.
 * It reads and writes through the raw collection, so the models' own setters/getters never
 * interfere with what is stored. Each write is guarded by the value that was read, so a
 * document edited while the script runs is skipped (and reported) instead of overwritten.
 */

const MODELS: Record<string, mongoose.Model<any>> = { Driver, Vendor, Payment, DriverPayout, VendorPayout, Order, User, ChatMessage, SupportTicket, SupportBotQuery, Notification, Review };
const BATCH_SIZE = 200;

type Fn = (v: any) => any;
interface Mode {
  string: Fn;
  json: Fn;
}

const MODES: Record<"encrypt" | "decrypt" | "rotate", Mode> = {
  encrypt: { string: encryptField, json: encryptJson },
  decrypt: { string: decryptField, json: decryptJson },
  rotate: {
    string: (v) => encryptField(decryptField(v)),
    json: (v) => encryptJson(decryptJson(v)),
  },
};

interface Change {
  path: string;
  from: unknown;
  to: unknown;
  kind: "string" | "json";
}

/** Collect the changes `fn` makes at `segments`, with array positions in the path ("a.0.b"). */
function collect(node: any, segments: string[], prefix: string, kind: Change["kind"], fn: Fn, out: Change[]) {
  if (node == null || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item, i) => collect(item, segments, prefix ? `${prefix}.${i}` : String(i), kind, fn, out));
    return;
  }
  const [head, ...rest] = segments;
  const path = prefix ? `${prefix}.${head}` : head;
  if (rest.length > 0) return collect(node[head], rest, path, kind, fn, out);

  const from = node[head];
  if (from === undefined) return;
  const to = fn(from);
  if (to !== from) out.push({ path, from, to, kind });
}

async function migrateModel(name: string, mode: Mode, apply: boolean) {
  const model = MODELS[name];
  const { paths, jsonPaths } = getEncryptedFields(model.schema);
  const projection: Record<string, 1> = {};
  for (const p of [...paths, ...jsonPaths]) projection[p.split(".")[0]] = 1;

  let scanned = 0;
  let changed = 0;
  let skipped = 0;
  let failed = 0;
  let ops: any[] = [];

  const flush = async () => {
    if (apply && ops.length) {
      const result = await model.collection.bulkWrite(ops, { ordered: false });
      skipped += ops.length - result.matchedCount;
    }
    ops = [];
  };

  for await (const doc of model.collection.find({}, { projection })) {
    scanned++;
    try {
      const changes: Change[] = [];
      for (const p of paths) collect(doc, p.split("."), "", "string", mode.string, changes);
      for (const p of jsonPaths) collect(doc, p.split("."), "", "json", mode.json, changes);
      if (!changes.length) continue;

      const filter: Record<string, unknown> = { _id: doc._id };
      const $set: Record<string, unknown> = {};
      for (const c of changes) {
        $set[c.path] = c.to;
        if (c.kind === "string") filter[c.path] = c.from; // guard: still the value we read
      }
      ops.push({ updateOne: { filter, update: { $set } } });
      changed++;
      if (ops.length >= BATCH_SIZE) await flush();
    } catch (err: any) {
      failed++;
      console.error(`${name} ${doc._id}: ${err.message}`);
    }
  }
  await flush();

  console.log(
    `${name}: scanned ${scanned}, ${apply ? "updated" : "would update"} ${changed - skipped}` +
      (skipped ? `, ${skipped} changed while running (re-run to pick them up)` : "") +
      `, failed ${failed}`
  );
  return failed;
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const mode = MODES[args.includes("--rollback") ? "decrypt" : args.includes("--rotate") ? "rotate" : "encrypt"];
  const names = args.filter((a) => !a.startsWith("--"));
  const selected = names.includes("all") ? Object.keys(MODELS) : names;
  const unknown = selected.filter((n) => !MODELS[n]);
  if (!selected.length || unknown.length) {
    throw new Error(`Name the models to migrate (or 'all'). Known: ${Object.keys(MODELS).join(", ")}${unknown.length ? `. Unknown: ${unknown.join(", ")}` : ""}`);
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not defined in .env");
  assertFieldEncryptionConfigured();

  await mongoose.connect(url);
  console.log(apply ? "APPLY" : "DRY RUN (nothing is written; add --apply)");
  let failed = 0;
  for (const name of selected) failed += await migrateModel(name, mode, apply);
  await mongoose.disconnect();
  if (failed) process.exit(1);
}

main().catch(async (err) => {
  console.error(err.message || err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
