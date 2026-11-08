# Database migrations & backward compatibility

This project has no migration framework — schema changes happen by editing a
Mongoose model directly. That's fine for additive changes, but it means the
*process* of making a change safely has to be a habit, not a tool. This is
that habit, written down.

## The core rule

**A deployed backend change must work with every app version still installed
on a real device.** Users don't update the moment you ship a backend change —
some will be on last week's build for days. If a backend change assumes a
field exists that an older app version never sent, that user's requests
break.

## When adding a field to a model

- Add it as optional (`required: false`, or no `required` at all) with a
  sensible default in code wherever it's read, not just in the schema.
- Never assume the field is present on existing documents — old documents in
  the database won't have it until something writes to them.
- If the field is genuinely required going forward, backfill existing
  documents in a one-off script under `src/scripts/` (see existing scripts
  there for the pattern) before making code depend on it unconditionally.

## When removing or renaming a field

- Don't remove the old field from the schema in the same change that stops
  writing to it. Leave it readable (even if unused) for at least one release
  cycle, in case a rollback needs it or an old app version still reads it.
- Renaming is a remove + add, not an atomic operation in Mongoose — treat it
  as both of the above combined.

## When changing a field's meaning or type

This is the riskiest kind of change (e.g. a string enum gaining a new value,
a field changing from a single value to an array). Before shipping:

- Check every place in `backend/src/modules/**` that reads the field, not
  just the one you're changing it for.
- Check whether the field is sent as-is to any client in an API response —
  if so, older app versions parsing that response may not expect the new
  shape.

## Testing a migration

There's no staging database distinct from production in this project today.
If a change needs backfilling real data, test the backfill script's logic
against a small, manually-verified subset first (e.g. `.limit(5)` while
developing it), and keep it idempotent — safe to run twice — in case it needs
re-running after a partial failure.
