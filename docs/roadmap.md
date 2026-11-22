# Roadmap

Take an item on only after it has caused a real problem in a working session.

## Near term

1. **First behavioral run on 1.0.0, on sonnet and on the most capable model the
   CLI offers.** No case has been run since the skills were generalized. Commit
   the summaries and read `totals.outcome` and `totals.overhead`.
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
4. **Outcome graders for the general-purpose cases.** The new non-software
   cases (`brainstorming-fires-on-open-topic`, `planning-fires-on-settled-goal`,
   `debugging-fires-on-unknown-cause`) check routing only. Add an outcome grader
   to each (intent asked before a format; steps with done-checks; evidence
   before a cause) once a first run shows what the baseline misses.

## Later

5. A user-invoked setup skill (`GLOSSARY.md` and ADR locations); a `handoff`
   skill.
6. Windows (`run-hook.cmd`) and other harnesses (Codex, Cursor, OpenCode).
