# Roadmap

Take an item on only after it has caused a real problem in a working session.

## Near term

1. **Full eval re-run on 0.13.0.** The last full sonnet suite is 0.12.0; 0.13.0
   re-ran only the 15 affected cases. Re-run all 41 when the CLI or default model
   changes (command in `docs/evals.md`).
2. **`claude plugin validate . --strict` in CI.** CI runs `npm test` and
   shellcheck; plugin validation stays local until the CLI installs in CI
   without credentials.
3. **Check the guard live.** Confirm that `permissionDecision: "ask"` prompts the
   user and whether Grep reaches dotfiles for `*.env`. Accepted gaps: `.ENV` case,
   `cat .env*`, JSON unicode escapes, `cd node_modules && grep -rn .`, a repo
   root named `build`, anything past the first 8 KB of a Bash command; a `.env`
   word in a quoted commit message and `jq .key` ask instead of allow.
4. **Stays-quiet evals** for `executing-plans` and `systematic-debugging`; only
   the router's generic quiet case covers them.
5. **Open measurements** (`docs/evals.md`): B1 never ran (the CLI refused the Bash
   grant); B2 is undecided and needs 10 runs, and its variant script is not in
   the repo.

## Later

6. Deeper `principles` evals: show that a reference changes a design decision on a
   refactoring or legacy task.
7. Scripts for `executing-plans` (`task-brief`, `review-package`) if agents often
   get the git commands wrong.
8. A user-invoked setup skill (issue tracker, `GLOSSARY.md` and ADR locations),
   then `to-tickets` and `triage`; a `handoff` skill.
9. Domain skills from addy as needs arise: observability, API design, CI/CD.
10. Windows (`run-hook.cmd`) and other harnesses (Codex, Cursor, OpenCode).
