# Roadmap

Take an item on only after it has caused a real problem in a working session.

## Near term

1. **First behavioral run on 1.0.0, on sonnet and on the most capable model the
   CLI offers.** No case has been run since the skills were generalized. Commit
   the summaries and read `totals.lift`, `totals.regressions`, and
   `totals.overhead`.
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
4. **Check the lift graders against the baseline.** Every grader now declares
   `lift`, `guard`, or `protocol` (`evals/grader-kinds.json`); none has run yet.
   After the first run, a lift grader the no-plugin arm also passes measures
   nothing: make its prompt harder or cut it; do not relabel it `guard` after
   the fact. Also confirm on that run that `--allow-tools Write Edit` makes the
   `no-files`, `no-write`, and `no-edit` graders bite (the baseline arm of
   `brainstorming-holds-under-build-pressure` should write files), and that the
   scaffolded `CLAUDE.md` of `find-skills-follows-project-skill-choice` loads.

## Later

5. A user-invoked setup skill (`GLOSSARY.md` and ADR locations); a `handoff`
   skill.
6. Windows (`run-hook.cmd`) and other harnesses (Codex, Cursor, OpenCode).
