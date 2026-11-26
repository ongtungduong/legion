# Third-party notices

Legion adapts material from the projects below. Each is MIT licensed unless
the table says otherwise; their notices are reproduced in full as the license
requires. Content was rewritten
and condensed, not copied wholesale, except where the table says a file was
copied; the table says what came from where.

| Legion file(s) | Adapted from |
|---|---|
| `hooks/session-start`, `hooks/hooks.json` | superpowers `hooks/session-start` |
| `skills/find-skills` | superpowers `using-superpowers`, addy `using-agent-skills` |
| `skills/brainstorming` | superpowers `brainstorming`; addy `spec-driven-development` (spec sections, boundaries) |
| `skills/brainstorming/references/grilling.md` | mattpocock `grilling` |
| `skills/planning` | superpowers `writing-plans`; addy `planning-and-task-breakdown` (read-only planning, dependency graph, vertical slices, file-count sizing and split rules, checkpoints every few steps, never overwriting an unfinished plan, tracker as task target, parallelization) and its `shared/definition-of-done.md` (the project's standing bar, read from the repo rather than restated) |
| `evals/plugin/` | addy `evals/plugin` (case layout and grader patterns) |
| `.github/workflows/ci.yml` | addy `.github/workflows/test-plugin-install.yml` (reduced to `npm test` and shellcheck) |
| `skills/std-development` | addy `spec-driven-development` (criteria before work, boundaries, Deferred list, delta specs, keeping the spec alive); addy `test-driven-development` (red-green-refactor, discovering the project's commands, test levels, real over mocks, anti-patterns). Merged and rewritten around the Unchanged and My-call criteria that baseline runs missed. superpowers `test-driven-development` and its `writing-good-tests.md` (name the break, mutation pass, change detectors, stand-in rules, hard-to-test as a design signal), `verification-before-completion` (revert to prove a check, every failure reported), `subagent-driven-development/task-reviewer-prompt.md` (Missing, Extra, Misunderstood). Later: mattpocock `tdd` and its `tests.md` (vertical slices in place of writing every test first, verifying through the caller's interface rather than a side channel); addy `spec-driven-development` (one spec per independently testable capability, ending the turn for spec approval) and `incremental-implementation/references/shared/definition-of-done.md` with superpowers `test-driven-development` (the other merge gates and clean output count in the final run) |
| `skills/debugging` | mattpocock `diagnosing-bugs`; superpowers `systematic-debugging` |
| `skills/debugging/assets/postmortem-template.md` | Google SRE Book, "Example Postmortem" (Appendix D): section structure only, wording Legion's own (the book is CC BY-NC-ND 4.0, so no text is copied) |
| `skills/skill-creator` | Same author: `duongot-skills/skill-creator` (MIT, ongtungduong), `name` renamed to match its directory, then aligned with Legion conventions: folded description, Gotchas, the Claude Code 20,000-byte limit (also a validator warning), and a baseline-first measurement step with `references/measuring.md` |
| `skills/security-audit`, `tests/scripts/security-audit/` | cloudflare `security-audit`: copied, not rewritten. `SKILL.md` restructured for Legion (Delegation with model tiers in place of the agent-neutral platform terms, Gotchas, Output format, default output directory `~/.legion/security-audit/`), the cost-budget section moved to `references/budget.md`, and the full-audit setup and planning sections (setup values, write isolation, coverage and prior runs, run profiles, the budget pointer) to `references/full-audit-setup.md`, the prior-run rules condensed to point at `references/reconnaissance.md`, and the promotion list replaced by a pointer to its identical fenced block in `references/hunting.md`. Reference files renamed to lowercase under `references/` (block identifiers follow: `attack-classes.md#Access control`), `(subagent_type: ...)` renamed `(role: ...)`, validators moved to `scripts/` and the schema to `assets/`, their tests to `tests/scripts/security-audit/` with paths updated |
| `skills/std-development/references/trust-boundaries.md`; in `skills/security-audit`: "Advisory and scanner triage" and "Dependency install-time execution" in `references/supply-chain-and-release.md`, the destructive-derived-path and secret-handling lines in `references/attack-classes.md`, the in-memory limiter line in `references/resource-exhaustion-and-availability.md`, Gotcha 12 | addy `security-and-hardening` and its `hardening-patterns.md` and `shared/security-checklist.md`: threat model first with STRIDE and abuse cases, "Ask first" changes, destructive operations on derived paths, SSRF with DNS rebinding, shared-store rate limiting, LLM output handling, names-only secret check and rotate-first, install-script gate, reachability triage of audit findings. Rewritten and condensed: the checklists and code patterns the model already knows were left out, and advisory severity was recast as a ceiling under the audit's evidence bar |
| `skills/prompt-optimization` and its `references/` | Anthropic platform docs, read 2026-11-25: `build-with-claude/prompt-engineering/` pages `claude-prompting-best-practices`, `prompting-claude-opus-5-5`, `prompting-claude-sonnet-5-5`, `prompting-claude-haiku-5-5`; `test-and-evaluate/develop-tests`; `test-and-evaluate/strengthen-guardrails/` pages `reduce-hallucinations`, `increase-consistency`, `mitigate-jailbreaks`, `reduce-prompt-leak` (all under https://platform.claude.com/docs/en/). Techniques and model facts summarized in Legion's own words; the short system-prompt lines Anthropic reports as tested are quoted, marked as such in `references/claude-models.md` and `references/guardrails.md`; the skill's focus (keeping the user's request, listing added assumptions) comes from Legion's baseline runs |
| `skills/subagent-orchestration` and its `references/`, `assets/` | Anthropic, "Which Claude model should you build with? Fable, Opus, Sonnet, or Haiku" (https://claude.dev/blog/which-claude-model-should-you-build-with/, 2026-11-09, read 2026-11-25): model by task, prices and defaults, effort and verification trade-offs, the escalation order, subagent, lead-and-workers, advisor, and model-switching patterns, Claude Code settings, measuring a setup; summarized in Legion's own words, figures attributed. Anthropic, "Building effective agents" (https://www.anthropic.com/research/building-effective-agents, 2024-12-19, read 2026-11-26): simplest solution first, the workflow patterns and their conditions, poka-yoke tools; Kim et al., "Towards a Science of Scaling Agent Systems" (arXiv 2512.08296) and Cemri et al., "Why Do Multi-Agent LLM Systems Fail?" (arXiv 2503.13657): findings cited with attribution in `references/evidence.md`. superpowers `dispatching-parallel-agents` (independent domains, one message for parallel dispatch, focused self-contained briefs) and `subagent-driven-development` (an explicit model on every dispatch, turn count beating token price, artifacts passed as files, no pasted history, no subagents started by workers, never pre-judging a reviewer, a ledger that survives compaction); addy `doubt-driven-development/references/shared/orchestration-patterns.md` (research isolation, fan-out checklist, depth of one, router and paraphrasing-orchestrator anti-patterns, agent teams for competing hypotheses); mattpocock `implement-spec` (context pointers, shared exploration notes, the task-graph frontier, a worktree per implementer) |
| `scripts/validate-spec.mjs` | Wraps `skills/skill-creator/scripts/validate_skill.py` |
| `scripts/validate.mjs`, `tests/` | superpowers `tests/skill-size`, `tests/skill-layout`; addy `scripts/validate-skills.js` |
| `scripts/trigger-evals.mjs`, `evals/triggers/` | addy `scripts/run-evals.js` (Tier 2 lexical routing) |

Source revisions used:

- superpowers: https://github.com/obra/superpowers @ `22f0b463e7a5` (2026-11-03, v7.0.2)
- addyosmani/agent-skills: https://github.com/addyosmani/agent-skills @ `301b02b12bff` (2026-11-01); `skills/incremental-implementation/references/shared/definition-of-done.md` @ `e997ac5` (2026-11-23); `skills/doubt-driven-development/references/shared/orchestration-patterns.md` @ `e997ac5` (2026-11-23)
- mattpocock/skills: https://github.com/mattpocock/skills @ `4ae2317ddb22` (2026-10-31); `skills/engineering/implement-spec/SKILL.md` @ `d653911` (2026-11-24)
- cloudflare/security-audit-skill: https://github.com/cloudflare/security-audit-skill @ `c1c8a8c14710` (2026-09-14)

---

## superpowers

```
MIT License

Copyright (c) 2025 Jesse Vincent

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## addyosmani/agent-skills

```
MIT License

Copyright (c) 2025 Addy Osmani

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## mattpocock/skills

```
MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## cloudflare/security-audit-skill

```
MIT License

Copyright (c) 2025-2026 Cloudflare, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
