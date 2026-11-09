# Roadmap

Ordered by suggested priority. Take an item on only after it has caused a real
problem in a working session (mattpocock's "observed failure" principle).

## Near term

1. **Run the behavioral evals.** Six cases are in `evals/plugin/` (fires /
   stays-quiet pairs for `executing-plans`, `systematic-debugging`, and
   `code-review`, a pressure case for the bar check, and the light router).
   Run `claude plugin eval . --no-publish` with `--model` pinned, record the
   model and the Claude Code version, and tune a description only where a
   case shows a miss. Add cases for `brainstorming` and `writing-plans` next.
2. **`claude plugin validate . --strict` in CI.** CI runs `npm test` and
   shellcheck; plugin validation still runs only locally until the CLI can be
   installed in CI without credentials.

## Medium term

3. **Evals for `coding-principles`.** Measure whether a rule set actually changes
   design decisions: compare with and without the skill on the same refactoring or
   legacy task. agent-rules-books itself admits there is no empirical data on this yet.
4. **Scripts for `executing-plans`.** Port `task-brief`, `review-package`, and `task-done`
   from superpowers if agents often get git commands wrong by hand.
5. **User-invoked setup skill** (after `setup-matt-pocock-skills`). Purpose: configure
   the issue tracker and the location of `GLOSSARY.md` and ADRs per repo, then add
   `to-tickets` and `triage`.
6. **`handoff` skill** (mattpocock). Compresses a working session into a document for
   another agent to continue from.
7. **Domain skills from addy**, one at a time as the need arises:
   `performance-optimization`, `observability-and-instrumentation`,
   `api-and-interface-design`, `ci-cd-and-automation`.
8. **Protective hooks**, written from scratch rather than copied from claudekit: block
   reading `.env` and block scanning `node_modules`/`dist`.

## Long term

9. **Windows support:** add a `run-hook.cmd` wrapper.
10. **Multiple harnesses:** Codex (`.codex-plugin` and tool-mapping notes), then
    Cursor/OpenCode.
