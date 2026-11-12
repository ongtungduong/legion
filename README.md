# Legion

A skills plugin for Claude Code. Legion makes the agent work like a disciplined
engineer: clarify intent before coding, plan in vertical slices, write the test
first, review on two axes, and say "done" only with evidence.

The process framework is based on [superpowers](https://github.com/obra/superpowers),
adding the strengths of [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills),
[mattpocock/skills](https://github.com/mattpocock/skills), and
[agent-rules-books](https://github.com/ciembor/agent-rules-books). For the origin of
each part, see [THIRD_PARTY.md](THIRD_PARTY.md) and [docs/architecture.md](docs/architecture.md).

## How it differs from superpowers

- **Light router.** Questions and small tasks are answered right away, without
  pulling in a process. A skill loads only when the task clearly matches. Discipline
  skills (executing-plans, debugging) keep their hard rules once loaded.
- **Shared language.** `GLOSSARY.md` and ADRs (from mattpocock) are written by
  brainstorming and read by executing-plans and code-review.
- **Two-axis review.** Spec and Standards run in parallel in two separate subagents
  (mattpocock), with addy's severity labels and a smell baseline.
- **Debugging starts from a feedback loop.** Following mattpocock: get a command
  that reproduces the bug red before forming hypotheses. superpowers' rule "after 3
  failed fixes, question the architecture" is kept.
- **Design and code right the first time.** `principles` holds four rule references: three synthesized from the 14 book rule sets in agent-rules-books, with their contradictions already settled (system design: boundaries, domain model, data, failure handling; coding: construction, refactoring, legacy code; performance: designing for load, measured optimization), and security (trust boundaries, abuse cases, always / ask-first / never controls, a checklist). The design questions are answered before the first test; the chosen references are written into the plan, the implementer applies them while coding and during REFACTOR, and the reviewer checks against each reference's final checklist.
- **Multi-perspective brainstorming.** Two methods: choose the approach with de Bono's Six Thinking Hats "choosing between alternatives" sequence, then grill the design in rounds until no decision is left implicit. Both run on four thinking models: first principles (White and Green hats; grilling asks only what a goal or constraint makes matter), inversion (Black hat; a "Wrong if" on every grilling recommendation), systems thinking (system map and second-order effects; grilling branches), and Pareto (scope cut, deciding criteria, grilling order). Depth scales with the size of the work.
- **Thinking models placed where decisions are made.** First principles lives in brainstorming's White and Green hats. Inversion is the Black hat in brainstorming and the pre-mortem step in writing-plans. Systems thinking is the system map and second-order effects in brainstorming, blast radius in code-review, and feedback loops in debugging. Pareto is the scope cut in brainstorming, slice order in writing-plans, and how findings are ranked in code-review. The full skill x model matrix is in [docs/architecture.md](docs/architecture.md).
- **Security and performance in every code change.** The `security` and `performance` references of `principles` are loaded by the chain: the spec and plan name the trust boundaries and the performance budget, the quick path loads the `security` reference before the first test when a change touches it (plan tasks load both), and reviewers check against their checklists. `principles` reads the `security` reference at the design step whenever a change crosses a trust boundary, so controls are placed by design instead of bolted on. A whole-repo target in `code-review` runs both as system audits with one shared report format; the security one is Cloudflare's multi-agent audit (coverage ledger, independent verifiers, `confirmed` / `needs_validation` verdicts, validated `findings.json`). A first request to skip a safety step keeps the cheap control and says why.
- **A guard hook.** `hooks/guard` asks before a tool touches `.env`, keys, or certificates, and blocks whole-folder scans of `node_modules`, `dist`, and `build`. Bash builtins only; `LEGION_GUARD=off` turns it off. It is a convenience, not a security boundary.
- **Spec-driven and test-driven throughout.** TDD starts by settling acceptance criteria; every test traces back to a criterion; every task in a plan states which spec requirement it implements.
- **agentskills.io standard.** Every skill was rewritten with `skill-creator`: the description states both *what* and *when*, the body follows the Workflow / Gotchas structure, long templates live in `assets/`, and the skill-creator validator runs in `npm test`.
- **Deterministic trigger evals.** Following addy: CI checks that descriptions
  contain the vocabulary users actually use.
- **Measured behavior.** Every skill has behavioral evals (`claude plugin eval`): it fires, stays quiet on near misses, holds under pressure, and changes the code it produces compared with no plugin. Results, model, CLI version, and cost are logged in [docs/evals.md](docs/evals.md).

## Installation

This repo is its own marketplace (`legion-dev`). Inside Claude Code:

```
/plugin marketplace add ongtungduong/legion
/plugin install legion@legion-dev
```

Or from a shell:

```bash
claude plugin marketplace add ongtungduong/legion
claude plugin install legion@legion-dev
```

Start a new session (or run `/clear`): the SessionStart hook injects the router,
and the skills appear as `legion:<name>`. Check with `claude plugin list`.

Update or remove:

```bash
claude plugin marketplace update legion-dev   # fetch the latest commit
claude plugin update legion@legion-dev        # install it (restart Claude Code after)
claude plugin uninstall legion@legion-dev
```

Claude Code installs a new copy only when `version` in `plugin.json` changes,
so every release bumps it. Third-party marketplaces do not auto-update by
default; turn it on under `/plugin` > Marketplaces > Enable auto-update.

To try a local checkout without installing:

```bash
claude --plugin-dir /path/to/legion
```

> If superpowers is enabled, disable it while using Legion. Both inject a router at
> SessionStart and have skills with the same names (brainstorming, writing-plans, executing-plans, systematic-debugging):
> `claude plugin disable superpowers@claude-plugins-official`

## Workflow

```
brainstorming ─▶ writing-plans ─▶ executing-plans ─▶ code-review (final)
                                        │
                                        └─ spec + TDD + principles (design, code, performance, security) + evidence gate in every task,
                                           inline or subagent chosen by the agent per task
```

How much of it applies depends on the size of the work. For a small change,
brainstorming shrinks to one short confirmation step. Chores skip the process entirely.

Documents the agent creates:

| Type | Location |
|---|---|
| Design doc | `.legion/specs/YYYY-MM-DD-<topic>-design.md` |
| Plan | `.legion/plans/YYYY-MM-DD-<topic>.md` |
| Plan-run ledger (gitignored) | `.legion/runs/<plan>/progress.md` |
| Decision records | `docs/adr/NNNN-*.md` |

## Skills

| Skill | Use for | Main sources |
|---|---|---|
| `using-legion` | Router, loaded at SessionStart | superpowers, rewritten to be lighter |
| `brainstorming` | Clarifying intent, first-principles thinking, comparing approaches with the Six Thinking Hats, grilling in rounds (merged from the old grilling skill, including when only a plan needs stress-testing), writing the design doc, recording ADRs and glossary terms | superpowers + addy (spec) + mattpocock (grilling, ADR, glossary) + de Bono |
| `writing-plans` | Splitting a spec into vertical-slice tasks, ordering slices by value (Pareto), pre-mortem | superpowers + addy (slicing, sizing) + Klein (pre-mortem) |
| `executing-plans` | All code work, with or without a plan: settle acceptance criteria, TDD, follow principles, evidence gate before reporting done, including a check that no test or lint was weakened to get there. Before an irreversible step, one decision gets a fresh adversarial review. The agent chooses inline or subagent per task, with a ledger. Implementer subagents run in their own git worktree, with the model chosen by role (haiku/sonnet/opus). Merged from the old TDD and verification skills. | superpowers (executing-plans + SDD + TDD + verification) + mattpocock (seams, anti-patterns) + addy (bar check, docs for version-sensitive APIs, doubt review) + mattpocock (PR body) |
| `systematic-debugging` | Bugs, failing tests, slowness, flakiness | mattpocock (feedback loop, human-in-the-loop script) + superpowers |
| `code-review` | Two-axis diff/PR review at three depths: reviewers by angle, a failure scenario or quoted rule per finding, independent verification, design and security principles as binding standards; focused security review ("is this safe?") with attack classes per domain; system audit with the full multi-agent security audit and pen-test; receiving review | mattpocock + addy + superpowers + Claude Code `/code-review` (method) + awesome-skills `code-review-skill` + Cloudflare `security-audit` (principles, verdicts, severity, audit workflow, attack classes, validators) |
| `principles` | Design and code right the first time: system design (boundaries, domain model, data, failure handling), coding (construction, refactoring, legacy code), performance (design for load, measured optimization toward a budget, web, system audit), and security (trust boundaries, abuse cases, always / ask-first / never controls, checklist; read at the design step whenever a trust boundary is crossed) | agent-rules-books (14 rule sets, synthesized by topic) + addy (`performance-optimization`, `web-performance-auditor`, `security-and-hardening`, condensed) + Cloudflare `security-audit` (operating modes) |
| `skill-creator` | Creating, editing, and validating skills against agentskills.io | duongot-skills/skill-creator |

## Development

```bash
npm test                 # validate + validate:spec + trigger evals + hook and script tests
npm run validate         # repo structure: links, router, README, manifests, versions
npm run validate:spec    # each skill against agentskills.io (skill-creator validator, needs python3)
npm run evals:triggers   # vocabulary routing (TF-IDF)
claude plugin eval . --no-publish --model sonnet   # behavioral evals in evals/plugin/ (about $0.05 a run); log results in docs/evals.md
claude plugin validate . --strict
```

Conventions for contributors (agents included) are in [AGENTS.md](AGENTS.md).
Remaining work is in [docs/roadmap.md](docs/roadmap.md).

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY.md](THIRD_PARTY.md).
