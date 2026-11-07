import mongoose, { Schema } from "mongoose";
import { decryptField, encryptField, isEncrypted } from "../../utils/fieldCrypto";

/**
 * Mongoose plugin: keep the listed fields encrypted in MongoDB and plain in code.
 *
 *   DriverSchema.plugin(encryptedFields, {
 *     paths: ["panNumber", "bankAccounts.accountNumber"],   // string fields
 *     jsonPaths: ["orderData"],                             // whole Mixed/object values
 *   });
 *
 * - Writes: a setter on each path encrypts on assignment, so `save`, `create`, `insertMany`,
 *   `updateOne`/`findOneAndUpdate` (`$set`) and pushed subdocuments all store ciphertext.
 * - Reads: a getter decrypts, so `doc.panNumber` is plain. `toJSON()` / `toObject()` are
 *   decrypted by a transform (not `getters: true`, which would also add virtuals like `id`).
 * - `.lean()` skips getters, so post-query hooks decrypt lean results in place.
 * - Values that are not encrypted yet (not migrated) are read as they are.
 * - `jsonPaths` store the whole value as one encrypted BSON-extended-JSON string, so Dates and
 *   ObjectIds inside it survive. Mutating the returned object does not change the document:
 *   assign the field again.
 *
 * NOT covered, by design of MongoDB/Mongoose: `aggregate()` and raw `Model.collection` reads
 * return ciphertext, and a query filter on an encrypted path will never match (random IV).
 * Do not filter, sort, group or index on these paths.
 */

export interface EncryptedFieldsOptions {
  /** Dot paths of string fields. Use `array.field` for fields inside an array of subdocuments. */
  paths?: string[];
  /** Dot paths whose whole value (object, array, ...) is encrypted as one JSON blob. */
  jsonPaths?: string[];
}

const EJSON = (mongoose.mongo as any).BSON.EJSON as {
  stringify(value: unknown, options?: { relaxed?: boolean }): string;
  parse(text: string, options?: { relaxed?: boolean }): any;
};

/** Encrypt an object/array value. Strings (already encrypted or legacy) and empty values pass through. */
export function encryptJson<T>(value: T): T | string {
  if (value === null || value === undefined || typeof value !== "object") return value;
  return encryptField(EJSON.stringify(value, { relaxed: false }));
}

/** Inverse of {@link encryptJson}. Values that are not encrypted (legacy objects) are returned as they are. */
export function decryptJson<T>(value: T): any {
  if (!isEncrypted(value)) return value;
  return EJSON.parse(decryptField(value) as string, { relaxed: true });
}

type Kind = "string" | "json";
const registry = new WeakMap<Schema, { paths: string[]; jsonPaths: string[] }>();

/** The encrypted paths declared on a schema (used by the migration script). */
export function getEncryptedFields(schema: Schema): { paths: string[]; jsonPaths: string[] } {
  return registry.get(schema) ?? { paths: [], jsonPaths: [] };
}

/** Apply `fn` to the value at `segments` inside `target`, walking through arrays. */
function mapPath(target: any, segments: string[], fn: (v: any) => any): void {
  if (target == null || typeof target !== "object") return;
  if (Array.isArray(target)) {
    for (const item of target) mapPath(item, segments, fn);
    return;
  }
  const [head, ...rest] = segments;
  if (rest.length === 0) {
    if (head in target) target[head] = fn(target[head]);
    return;
  }
  mapPath(target[head], rest, fn);
}

/** Apply `fn` to every declared path in a plain object (mutates it). */
export function mapEncryptedPaths(obj: any, paths: string[], fn: (v: any) => any): void {
  for (const path of paths) mapPath(obj, path.split("."), fn);
}

/** Where a path lives: the (sub)schema that owns it and the path relative to that schema. */
interface Owner {
  schema: Schema;
  path: string;
  kind: Kind;
}

/** Attach setter/getter to one path, descending into subdocuments. Returns the schema that owns it. */
function wrapPath(schema: Schema, path: string, kind: Kind): Owner {
  // Descend first: `schema.path("items.name")` resolves straight to the subschema's path, which
  // would make the parent look like the owner.
  const segments = path.split(".");
  for (let i = 1; i < segments.length; i++) {
    const parent = schema.path(segments.slice(0, i).join(".")) as any;
    if (parent?.schema) {
      return wrapPath(parent.schema, segments.slice(i).join("."), kind);
    }
  }

  const direct = schema.path(path);
  if (!direct || (direct as any).schema) {
    throw new Error(`encryptedFields: path '${path}' is not in the schema`);
  }
  direct.set((v: unknown) => (kind === "json" ? encryptJson(v) : encryptField(v)));
  direct.get((v: unknown) => (kind === "json" ? decryptJson(v) : decryptField(v)));
  return { schema, path, kind };
}

function decryptOnSerialize(schema: Schema, option: "toJSON" | "toObject"): void {
  const existing: any = schema.get(option) || {};
  schema.set(option, { ...existing, getters: true, virtuals: false } as any);
  // Mongoose caches the merged toJSON/toObject options the first time a document is serialized,
  // and `set` does not clear it. Subschemas can be cached already, so drop it or the option is ignored.
  (schema as any)._defaultToObjectOptionsMap = undefined;
}

/** The populate option comes as a path map, an array, a single option or a path string. */
function populateList(populate: any): any[] {
  if (!populate) return [];
  if (typeof populate === "string") return [{ path: populate }];
  if (Array.isArray(populate)) return populate.flatMap(populateList);
  if (typeof populate.path === "string") return [populate];
  return Object.values(populate).flatMap(populateList);
}

function populatedModel(model: any, pop: any): any {
  try {
    if (pop.model && typeof pop.model !== "string") return pop.model;
    const type: any = model.schema.path(pop.path);
    const ref = pop.model ?? type?.options?.ref ?? type?.options?.type?.[0]?.ref ?? type?.caster?.options?.ref;
    return typeof ref === "string" ? model.db.model(ref) : ref;
  } catch {
    return null;
  }
}

/** Decrypt a lean result (one document or many) and any documents populated into it. */
function decryptLeanTree(model: any, value: any, populate?: any): void {
  if (value == null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) decryptLeanTree(model, item, populate);
    return;
  }
  const own = getEncryptedFields(model.schema);
  mapEncryptedPaths(value, own.paths, decryptField);
  mapEncryptedPaths(value, own.jsonPaths, decryptJson);
  for (const pop of populateList(populate)) {
    const ref = populatedModel(model, pop);
    if (!ref?.schema) continue;
    mapEncryptedPaths(value, [pop.path], (populated) => {
      decryptLeanTree(ref, populated, pop.populate);
      return populated;
    });
  }
}

export function encryptedFields(schema: Schema, options: EncryptedFieldsOptions): void {
  const paths = options.paths ?? [];
  const jsonPaths = options.jsonPaths ?? [];
  registry.set(schema, { paths, jsonPaths });

  const owners = [
    ...paths.map((p) => wrapPath(schema, p, "string")),
    ...jsonPaths.map((p) => wrapPath(schema, p, "json")),
  ];

  // toJSON()/toObject() apply the path getters (which decrypt) but not virtuals, so `id` and friends
  // do not leak into responses. This is done with options rather than a `transform` function:
  // a subdocument serialized on its own (`res.json(user.addresses)`) only sees its own schema's
  // options, and Mongoose rebuilds implicit subschemas from the parent's plain options (dropping
  // any transform function) when the model is compiled. Set on the root as well as on every
  // subschema that owns a path, so both routes carry it.
  for (const target of new Set<Schema>([schema, ...owners.map((o) => o.schema)])) {
    decryptOnSerialize(target, "toJSON");
    decryptOnSerialize(target, "toObject");
  }

  // Lean results are plain objects straight from the driver: no getters run on them. Populated
  // documents in the result are plain too, so they are decrypted with their own model's paths.
  const decryptLean = function (this: any, result: any) {
    const opts = this.mongooseOptions?.();
    if (!result || !opts?.lean) return;
    decryptLeanTree(this.model, result, opts.populate);
  };
  for (const op of ["find", "findOne", "findOneAndUpdate", "findOneAndReplace", "findOneAndDelete"] as const) {
    schema.post(op, decryptLean);
  }
}
