# Roadmap

Take an item on only after it has caused a real problem in a working session.

## Near term

1. **Full eval re-run on 0.14.0, on sonnet and on the most capable model the CLI
   offers.** The last full sonnet suite is 0.12.0 and has no outcome-only figure;
   0.13.0 and 0.14.0 re-ran only affected cases. A full run on the strongest model
   is the first evidence of whether the harness helps it. Commit the summaries and
   read `totals.outcome` and `totals.overhead`.
2. **`claude plugin validate . --strict` in CI.** CI runs `npm test` (shellcheck
   included); plugin validation stays local until the CLI installs in CI
   without credentials.
3. **Check the guard live.** Confirm that `permissionDecision: "ask"` prompts the
   user (now also for `dist` and `build` scans) and whether Grep reaches dotfiles
   for `*.env`. Known: a Bash command that only mentions `node_modules` as text
   (a heredoc, a commit message) can be denied, and the denial now names the way
   out. Accepted gaps: `.ENV` case,
   `cat .env*`, JSON unicode escapes, `cd node_modules && grep -rn .`,
   `git grep foo -- node_modules`, a repo root named `build`, anything past the
   first 8 KB of a Bash command; a `.env` word in a quoted commit message and
   `jq .key` ask instead of allow, and a quoted string or function body that
   contains `grep -r foo node_modules` is denied as if it ran.
4. **Open measurements** (`docs/evals.md`): B1 and the three `-fixture` cases
   never ran (the CLI refuses the Bash grant inside the tool sandbox; run them
   from an unsandboxed terminal); B2 is undecided and needs 10 runs, and its
   variant script is not in the repo.
5. **Trigger exceptions.** Five positive prompts in `evals/triggers/` rank their
   skill #2 and carry `top_k: 2`. Sharpen the `executing-plans` and `principles`
   descriptions so they rank #1, then drop the exceptions (a description change:
   bump the version and re-run the affected behavioral cases).

6a. **Cut candidates, by ablation.** `principles/references/coding.md` is the
   default for any code and is mostly textbook material a strong model already
   applies; the fixed three-to-five hypotheses, the per-plan pre-mortem, and the
   quick path's baseline suite run on every change. Measure each against the
   no-plugin arm on the strongest model (B1 is the first) and cut what shows no
   outcome delta; a safety control or a project fact stays even with no delta.
6b. **Reconcile `executing-plans-batches-queries`** (-0.33 on sonnet, 0.12.0):
   read its transcripts and rule whether the skill or the grader was wrong.

## Later

6. Deeper `principles` evals: show that a reference changes a design decision on a
   refactoring or legacy task.
7. Scripts for `executing-plans` (`task-brief`, `review-package`) if agents often
   get the git commands wrong.
8. A user-invoked setup skill (issue tracker, `GLOSSARY.md` and ADR locations),
   then `to-tickets` and `triage`; a `handoff` skill.
9. Domain skills from addy as needs arise: observability, API design, CI/CD.
10. Windows (`run-hook.cmd`) and other harnesses (Codex, Cursor, OpenCode).
