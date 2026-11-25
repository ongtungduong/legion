# Rollout safety

Read when a step changes something that keeps running or keeps its state
while the change ships: a database schema or stored data, a public API, an
event or message format, a cache or file format, shared config, or
infrastructure. The question for each such step: what is still running, or
still stored, that expects the old shape?

## Find what coexists

Before choosing a pattern, say which of these hold. Each comes from step 2's
reading; one you could not confirm is an assumption and a question at
hand-off.

| Situation | Old and new coexist because |
|---|---|
| Rolling or canary deploy | Old instances serve traffic after the migration or alongside new ones |
| Several services share a database or a topic | Each deploys on its own schedule |
| Mobile, desktop, or third-party clients | They update days or months late, some never |
| Queued jobs, events, caches, files | Data written in the old shape is read by new code, and the reverse during a rollback |
| Blue-green with one database | The idle color must still work if traffic is switched back |

If none holds (one instance, downtime accepted, nothing stored), say so in
Assumptions and skip the staging below.

## Expand, migrate, contract

The default for a schema, data, or contract change while old and new
coexist. Each stage is its own step and deploy, and each is safe to roll
back to the one before.

1. **Expand.** Add the new shape next to the old (new column nullable or
   with a default, new field optional, new endpoint or version beside the
   old). Old code keeps working untouched.
2. **Write both.** New code writes old and new shapes (or a trigger keeps
   them in sync), still reading the old.
3. **Backfill.** Copy existing data into the new shape in batches that can
   be re-run; verify counts or checksums match.
4. **Switch reads.** New code reads the new shape. Rollback is a code
   redeploy, since the old shape is still written.
5. **Stop writing the old shape**, once no running version or consumer
   reads it (check consumers, logs, or metrics, not memory).
6. **Contract.** Drop the old shape in a later deploy, after the window in
   which a rollback to a version that reads it could happen.

Small changes may merge stages (expand and write both in one deploy), but
never contract in the same deploy as the switch.

## Other controls

- **Feature flag** for behavior a deploy cannot take back (emails sent,
  charges made, data rewritten): ship dark, enable for a slice, watch,
  widen. The flag's removal is a step in the plan, not a someday.
- **Versioned API or event** when consumers are outside your deploy: the
  old version keeps working until its consumers have moved; the plan names
  who tells them and the step that removes it.
- **Irreversible data steps** (deletes, lossy transforms): a backup or an
  export taken and its restore tested in the same step, before the change.
- **Infrastructure**: plan the change, apply to a non-production
  environment first, and name the command that reverts it.

## Every staged step names

- **Rollback:** the exact action (redeploy version N, flip flag off, run
  down-migration) and what it cannot undo.
- **Safe-to-keep signal:** what is watched and for how long (error rate,
  a query that finds rows in the old shape, consumer lag) before the next
  stage starts.

## Gotchas

- A down-migration that drops a column added and written in the up
  migration deletes the data written in between; often the true rollback is
  forward-only.
- A rename is a drop plus an add to every reader that has not deployed yet.
- Backfills on large tables lock or saturate; batch them and say the batch
  size and how a stopped run resumes.
- Default values and NOT NULL added to an existing large table can rewrite
  it; check the database's behavior before choosing the step.
