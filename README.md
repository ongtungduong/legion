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
- **Shared language.** `GLOSSARY.md` and ADRs (from mattpocock) are built into
  brainstorming, executing-plans, and code-review.
- **Two-axis review.** Spec and Standards run in parallel in two separate subagents
  (mattpocock), with addy's severity labels and a smell baseline.
- **Debugging starts from a feedback loop.** Following mattpocock: get a command
  that reproduces the bug red before forming hypotheses. superpowers' rule "after 3
  failed fixes, question the architecture" is kept.
- **Best practices from classic books.** `coding-principles` picks one primary rule set (plus at most one companion) from the 14 in agent-rules-books, by task type and a compatibility matrix. The rule set is written into the plan, the implementer applies it while coding and during REFACTOR, and the reviewer checks against that set's own checklist.
- **Multi-perspective brainstorming.** Reduce the problem to what *must be true* (first principles), compare approaches with de Bono's Six Thinking Hats "choosing between alternatives" sequence, then grill the design in rounds until no decision is left implicit. Depth scales with the size of the work.
- **Thinking models placed where decisions are made.** First principles lives in brainstorming. Inversion is the Black hat in brainstorming and the pre-mortem step in writing-plans. Systems thinking is the system map and second-order effects in brainstorming, blast radius in code-review, and feedback loops in debugging. Pareto is the scope cut in brainstorming, slice order in writing-plans, and how findings are ranked in code-review.
- **Spec-driven and test-driven throughout.** TDD starts by settling acceptance criteria; every test traces back to a criterion; every task in a plan states which spec requirement it implements.
- **agentskills.io standard.** Every skill was rewritten with `skill-creator`: the description states both *what* and *when*, the body follows the Workflow / Gotchas structure, long templates live in `assets/`, and the skill-creator validator runs in `npm test`.
- **Deterministic trigger evals.** Following addy: CI checks that descriptions
  contain the vocabulary users actually use.

## Installation

Try it directly from the directory:

```bash
claude --plugin-dir /path/to/legion
```

Or install through a local marketplace:

```
/plugin marketplace add /path/to/legion
/plugin install legion@legion-dev
```

> If superpowers is enabled, disable it while using Legion. Both inject a router at
> SessionStart and have skills with the same names (brainstorming, writing-plans, executing-plans, systematic-debugging):
> `claude plugin disable superpowers@claude-plugins-official`

## Workflow

```
brainstorming ─▶ writing-plans ─▶ executing-plans ─▶ code-review (final)
     │                                  │
     └─ defining-terms                  └─ spec + TDD + coding-principles + evidence gate in every task,
                                           inline or subagent chosen by the agent per task
```

How much of it applies depends on the size of the work. For a small change,
brainstorming shrinks to one short confirmation step. Chores skip the process entirely.

Documents the agent creates:

| Type | Location |
|---|---|
| Design doc | `docs/legion/specs/YYYY-MM-DD-<topic>-design.md` |
| Plan | `docs/legion/plans/YYYY-MM-DD-<topic>.md` |
| Plan-run ledger (gitignored) | `.legion/runs/<plan>/progress.md` |
| Shared language | `GLOSSARY.md`, `docs/adr/NNNN-*.md` |

## Skills

| Skill | Use for | Main sources |
|---|---|---|
| `using-legion` | Router, loaded at SessionStart | superpowers, rewritten to be lighter |
| `brainstorming` | Clarifying intent, first-principles thinking, comparing approaches with the Six Thinking Hats, grilling in rounds (merged from the old grilling skill, including when only a plan needs stress-testing), writing the design doc, recording ADRs | superpowers + addy (spec) + mattpocock (grilling, ADR) + de Bono |
| `defining-terms` | Terminology, `GLOSSARY.md` | mattpocock |
| `writing-plans` | Splitting a spec into vertical-slice tasks, ordering slices by value (Pareto), pre-mortem | superpowers + addy (slicing, sizing) + Klein (pre-mortem) |
| `executing-plans` | All code work, with or without a plan: settle acceptance criteria, TDD, follow coding-principles, evidence gate before reporting done, including a check that no test or lint was weakened to get there. Before an irreversible step, one decision gets a fresh adversarial review. The agent chooses inline or subagent per task, with a ledger. Implementer subagents run in their own git worktree, with the model chosen by role (haiku/sonnet/opus). Merged from the old TDD and verification skills. | superpowers (executing-plans + SDD + TDD + verification) + mattpocock (seams, anti-patterns) + addy (bar check, docs for version-sensitive APIs, doubt review) |
| `systematic-debugging` | Bugs, failing tests, slowness, flakiness | mattpocock (feedback loop) + superpowers |
| `code-review` | Two-axis diff/PR review; receiving review | mattpocock + addy + superpowers |
| `coding-principles` | Picking 1–2 rule sets from classic books (Clean Code, APoSD, Refactoring, WELC, Clean Architecture, DDD, DDIA, Release It!...) to shape code, avoiding conflicting pairs | agent-rules-books (14 mini editions) |
| `security-and-hardening` | Untrusted input, auth, secrets, PII, LLM output | addy (condensed) |
| `skill-creator` | Creating, editing, and validating skills against agentskills.io | duongot-skills/skill-creator |

## Development

```bash
npm test                 # validate + validate:spec + trigger evals + hook test
npm run validate         # repo structure: links, router, README, manifests, versions
npm run validate:spec    # each skill against agentskills.io (skill-creator validator, needs python3)
npm run evals:triggers   # vocabulary routing (TF-IDF)
claude plugin eval . --no-publish   # behavioral evals in evals/plugin/ (costs tokens; pin --model)
claude plugin validate . --strict
```

Conventions for contributors (agents included) are in [AGENTS.md](AGENTS.md).
Remaining work is in [docs/roadmap.md](docs/roadmap.md).

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY.md](THIRD_PARTY.md).
