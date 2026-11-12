# Legion

A skills plugin for Claude Code. Legion makes the agent work like a disciplined
engineer: clarify intent before coding, plan in vertical slices, write the test
first, review on two axes, and say "done" only with evidence.

Based on [superpowers](https://github.com/obra/superpowers), with material from
[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills),
[mattpocock/skills](https://github.com/mattpocock/skills), and
[agent-rules-books](https://github.com/ciembor/agent-rules-books). Origins:
[THIRD_PARTY.md](THIRD_PARTY.md), [docs/architecture.md](docs/architecture.md).

## What it does differently

- **Light router.** Questions and trivial edits are answered directly. A skill
  loads only when the task matches; once loaded, its hard rules hold.
- **Spec- and test-driven.** Acceptance criteria first, a failing test before
  each change, and no "done" without fresh evidence (including a check that no
  test or lint was weakened).
- **Design right the first time.** `principles` holds four references (system
  design, coding, performance, security). Design questions are answered before
  the first test; the plan names the references, and the reviewer checks their
  final checklists. Security wins over repo conventions.
- **Two-axis review.** Spec and Standards are reviewed by separate fresh-context
  subagents; every finding carries a failure scenario or a quoted rule and is
  verified independently. A whole-repo target runs an audit on system design,
  performance, and security after one scope-and-budget proposal.
- **Debugging starts from a reproduction** that goes red before any hypothesis.
- **Brainstorming in two methods:** compare approaches (Six Thinking Hats), then
  grill the design in rounds. Glossary terms and ADRs are written here and read
  by later skills.
- **A guard hook** asks before a tool touches `.env`, keys, or certificates and
  blocks whole-folder scans of `node_modules`, `dist`, `build`. A convenience,
  not a security boundary; `LEGION_GUARD=off` disables it.
- **Measured.** Trigger evals run in CI; behavioral evals (`claude plugin eval`)
  are logged with model, CLI version, and cost in [docs/evals.md](docs/evals.md).

## Installation

```
/plugin marketplace add ongtungduong/legion
/plugin install legion@legion-dev
```

Or from a shell: `claude plugin marketplace add ongtungduong/legion`, then
`claude plugin install legion@legion-dev`. Start a new session (or `/clear`):
the SessionStart hook injects the router and the skills appear as
`legion:<name>`.

```bash
claude plugin marketplace update legion-dev   # fetch the latest commit
claude plugin update legion@legion-dev        # install it, then restart
claude plugin uninstall legion@legion-dev
claude --plugin-dir /path/to/legion           # try a local checkout
```

A new copy is installed only when `version` in `plugin.json` changes, so every
release bumps it. If superpowers is enabled, disable it
(`claude plugin disable superpowers@claude-plugins-official`): both inject a
router and share skill names.

## Workflow

```
brainstorming ─▶ writing-plans ─▶ executing-plans ─▶ code-review (final)
                                        ├─ unexpected failure ─▶ systematic-debugging ─▶ back to the task
                                        └─ spec + TDD + principles + evidence gate in every task,
                                           inline or subagent per task
```

The process scales with the work: a small change collapses brainstorming into one
confirmation, a chore skips the flow. A bug report enters at
`systematic-debugging`; its fix runs through `executing-plans`.

| Document | Location |
|---|---|
| Design doc | `.legion/specs/YYYY-MM-DD-<topic>-design.md` |
| Plan | `.legion/plans/YYYY-MM-DD-<topic>.md` |
| Plan-run ledger (gitignored) | `.legion/runs/<plan>/progress.md` |
| Decision records | `docs/adr/NNNN-*.md` |

In your repo the plan workflow keeps `specs/` and `plans/` committed and
gitignores the rest of `.legion/`. Legion's own repo ignores all of it.

## Skills

| Skill | Use for |
|---|---|
| `using-legion` | Router, injected at SessionStart |
| `brainstorming` | Intent, approaches, grilling, design doc, ADRs, glossary |
| `writing-plans` | Approved spec to vertical-slice tasks, ordered by value, with a pre-mortem |
| `executing-plans` | All code work, with or without a plan: criteria, TDD, principles, evidence gate; plan runs use a ledger and per-task inline or subagent work |
| `systematic-debugging` | Bugs, failing or flaky tests, regressions |
| `code-review` | Diff/PR review, "is this safe?", whole-repo audit, receiving review |
| `principles` | System design, coding, performance, and security references |
| `skill-creator` | Creating and validating skills against agentskills.io |

## Development

```bash
npm test                 # validate + validate:spec + trigger evals + hook and script tests
npm run validate         # repo structure: links, router, README, manifests, versions
npm run validate:spec    # skills against agentskills.io (needs python3)
npm run evals:triggers   # vocabulary routing (TF-IDF)
claude plugin validate . --strict
claude plugin eval . --no-publish --model sonnet --threshold 0.66 -j 3   # behavioral, costs tokens
```

Contributor rules: [AGENTS.md](AGENTS.md). Open work: [docs/roadmap.md](docs/roadmap.md).

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY.md](THIRD_PARTY.md).
