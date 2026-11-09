# Roadmap

Ordered by suggested priority. Take an item on only after it has caused a real
problem in a working session (mattpocock's "observed failure" principle).

## Near term

1. **Re-run the behavioral evals on each Claude Code release.** The 0.11.0
   baseline is in `docs/evals.md` (sonnet, Claude Code 2.1.319). Re-run with
   the same command when the CLI or the default model changes, and add a
   second model (haiku) to see which skills depend on the stronger model.
2. **`claude plugin validate . --strict` in CI.** CI runs `npm test` and
   shellcheck; plugin validation still runs only locally until the CLI can be
   installed in CI without credentials.
3. **Check the guard live.** Confirm in a real session that `permissionDecision:
   "ask"` prompts the user, and whether Claude Code's Grep reaches dotfiles
   for a glob like `*.env`. Known gaps accepted for a convenience guard:
   `.ENV` case, `cat .env*`, JSON unicode escapes, `cd node_modules && grep
   -rn .`, a repo root named `build` for Grep, and anything past the first
   8 KB of a Bash command.

## Medium term

4. **Deeper evals for `coding-principles`.** 0.11.0 shows the skill loads and
   names its set (`coding-principles-shapes-new-module`, 1.00 vs 0.00); it
   does not yet show that a rule set changes a design decision on a
   refactoring or legacy task. agent-rules-books itself has no empirical data
   on this.
5. **Scripts for `executing-plans`.** Port `task-brief`, `review-package`, and `task-done`
   from superpowers if agents often get git commands wrong by hand.
6. **User-invoked setup skill** (after `setup-matt-pocock-skills`). Purpose: configure
   the issue tracker and the location of `GLOSSARY.md` and ADRs per repo, then add
   `to-tickets` and `triage`.
7. **`handoff` skill** (mattpocock). Compresses a working session into a document for
   another agent to continue from.
8. **Domain skills from addy**, one at a time as the need arises:
   `observability-and-instrumentation`, `api-and-interface-design`,
   `ci-cd-and-automation` (`performance-optimization` shipped in 0.11.0).

## Long term

9. **Windows support:** add a `run-hook.cmd` wrapper.
10. **Multiple harnesses:** Codex (`.codex-plugin` and tool-mapping notes), then
    Cursor/OpenCode.
