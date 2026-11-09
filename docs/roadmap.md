# Roadmap

Ordered by suggested priority. Take an item on only after it has caused a real
problem in a working session (mattpocock's "observed failure" principle).

## Near term

1. **Behavioral evals with `claude plugin eval`.** Write paired "fires" and
   "stays quiet" cases in `evals/plugin/`, each with a `prompt.md` and `graders/`,
   following `addyosmani/agent-skills/evals/plugin`. Start with `executing-plans` (TDD),
   `systematic-debugging`, and `code-review`. When reporting numbers, record the model
   and the Claude Code version.
2. **Verify the light router.** Measure on real prompts: (a) a simple question
   triggers no skill; (b) "fix this bug" triggers
   `systematic-debugging`.
3. **CI.** Add GitHub Actions running `npm test`, `claude plugin validate . --strict`,
   and `shellcheck hooks/session-start tests/hooks/*.sh`.

## Medium term

4. **Evals for `coding-principles`.** Measure whether a rule set actually changes
   design decisions: compare with and without the skill on the same refactoring or
   legacy task. agent-rules-books itself admits there is no empirical data on this yet.
5. **Scripts for `executing-plans`.** Port `task-brief`, `review-package`, and `task-done`
   from superpowers if agents often get git commands wrong by hand.
6. **User-invoked setup skill** (after `setup-matt-pocock-skills`). Purpose: configure
   the issue tracker and the location of `GLOSSARY.md` and ADRs per repo, then add
   `to-tickets` and `triage`.
7. **`handoff` skill** (mattpocock). Compresses a working session into a document for
   another agent to continue from.
8. **Domain skills from addy**, one at a time as the need arises:
   `performance-optimization`, `observability-and-instrumentation`,
   `api-and-interface-design`, `ci-cd-and-automation`.
9. **Protective hooks**, written from scratch rather than copied from claudekit: block
   reading `.env` and block scanning `node_modules`/`dist`.

## Long term

10. **Windows support:** add a `run-hook.cmd` wrapper.
11. **Multiple harnesses:** Codex (`.codex-plugin` and tool-mapping notes), then
    Cursor/OpenCode.
