# Doubt review

Read this before an irreversible step or a claim no test can check. It puts
one decision in front of a fresh reviewer told to disprove it, while changing
course is still cheap. It is not `legion:code-review`, which judges a
finished diff; it checks one decision before it stands.

Skip it for mechanical work (renames, formatting, moves), for a step the user
specified exactly, and when the user asked for speed over verification.

## Workflow

1. **Claim.** Write the decision in two lines, plus why it matters if wrong:
   `Claim: the backfill is idempotent if re-run after a crash. Matters: a
   double run double-charges customers.` If you cannot write it that
   compactly, you have a hunch, not a decision; settle it first.
2. **Extract the smallest reviewable unit.** The **artifact** (the diff, the
   function, the migration, or the proposal in three to five sentences) and
   the **contract** it must satisfy (the spec lines, invariants, constraints).
   Leave out your reasoning, keep the evidence: a caller, guard, or test that
   bears on the claim goes in. Too big to hold in one read means split it.
3. **Doubt.** Write the prompt below to `.legion/doubt-<topic>.md` (add
   `.legion/` to `.gitignore` if missing and say so) and dispatch it with the Agent tool: `subagent_type: "general-purpose"` (a
   fresh context, never `fork`), no worktree (read-only), `model: "opus"`.
   Pass the artifact and the contract, never the claim: a reviewer handed
   your conclusion tends to agree with it.

   ```
   Adversarial review, read-only: do not modify files and do not dispatch
   subagents. Find what is wrong with this artifact; assume the author is
   overconfident. Look for unstated assumptions, unhandled edge cases, hidden
   coupling or shared state, ways the contract can be violated, conventions it
   breaks, and failure modes under unexpected input, retries, or concurrency.
   Do not validate or summarize. List issues, each with where and why, or say
   plainly that you found none after a thorough look. Under 300 words.

   ARTIFACT: <path or inline>
   CONTRACT: <path or inline>
   ```
4. **Reconcile.** The findings are data; you still decide. Re-read the
   artifact against each one and file it under the first class that fits:
   - *Contract unclear:* the reviewer misread because the contract was
     incomplete. Fix the contract, then re-run.
   - *Valid:* change the artifact, then re-run on the changed unit.
   - *Trade-off:* real, but fixing costs more than accepting. Ledger it as a
     `Ruling:` with its cost, so the user sees it.
   - *Noise:* correct under context the reviewer lacked. Note what context
     would have prevented it.
5. **Stop** when a round returns nothing new or only trivia, or after three
   rounds. Three rounds that still find substantive issues are a finding
   about the artifact: take it to the user rather than running a fourth.
   Report one line: `Doubt: <claim> - <rounds> rounds - <valid findings fixed,
   trade-offs ruled>`.

## Second model

A reviewer on the same model shares the author's blind spots. When the user
asks for a second opinion from another model (Codex CLI, Gemini CLI), confirm
the exact command with them, then run it read-only with the prompt file on
stdin, never interpolated into a shell argument, since an artifact full of
backticks and `$(...)` would run as shell. Shapes to check against the
installed tool's `--help`:

```bash
codex exec --sandbox read-only -C <repo> - < .legion/doubt-<topic>.md
gemini --approval-mode plan -p "" < .legion/doubt-<topic>.md
```

Never call an external CLI the user has not approved, and never in a
non-interactive run; say that the second model was skipped.

## Gotchas

- From inside a subagent you cannot dispatch a fresh reviewer. Report the
  decision as needing a doubt review and let the controller run it.
- A review in your own context is not a doubt review: you carry the
  reasoning it was meant to escape. Without a subagent tool, say the check
  was not independent.
- Deferring to the reviewer because it is fresh is the same failure as
  ignoring it; a fresh context also lacks context.
