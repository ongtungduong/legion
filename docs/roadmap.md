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
   scaffolded `CLAUDE.md` of `finding-skills-follows-project-skill-choice` loads.

5. **Ablate the lens tables.** `brainstorming`, `planning`, and `debugging`
   carry 28 named lenses, most of them textbook methods the model already
   knows and most with no grader. After item 1, re-run their lift cases from a
   copy of the plugin with the lens tables removed; a lens whose removal moves
   no lift grader goes to the skill's `references/lenses.md`, and only lenses
   with a measured delta stay in `SKILL.md`. Trigger words in the descriptions
   ("six hats", "first principles") stay either way: routing is measured
   separately.
6. **Trim descriptions near the 1024-character cap** (`brainstorming`,
   `debugging`, `auditing-security`) only after item 1 gives real trigger rates,
   so a cut does not drop a phrase that fires the skill.
7. **Check the new cases' first run.** `finding-skills-combines-stdd-with-legacy-skill`
   grades the project skill as a `Skill` call while
   `finding-skills-combines-method-and-project-skill` grades a `Read` of its
   `SKILL.md`; confirm which one Claude Code records for a project skill and
   align both.
8. **Diff `auditing-security` against upstream** (cloudflare
   `security-audit-skill`, pinned at `c1c8a8c14710` in `THIRD_PARTY.md`) when
   it tags a new release: the skill is a copy, so upstream fixes do not reach
   it on their own.

## Later

9. A user-invoked setup skill (`GLOSSARY.md` and ADR locations); a `handoff`
   skill.
10. Windows (`run-hook.cmd`) and other harnesses (Codex, Cursor, OpenCode).
