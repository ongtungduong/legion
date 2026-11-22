# Legion

A plugin of general-purpose working skills for Claude Code. Legion gives the
agent a method for the kinds of work that go wrong when improvised: deciding
what to do, laying out how to get it done, and finding why something broke.
None of it is tied to software; code is one kind of work among many.

Based on [superpowers](https://github.com/obra/superpowers), with material from
[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) and
[mattpocock/skills](https://github.com/mattpocock/skills). Origins:
[THIRD_PARTY.md](THIRD_PARTY.md), [docs/architecture.md](docs/architecture.md).

## What it does differently

- **A router, not a pipeline.** `router` is injected at session start and picks
  the skill that fits the work. Questions and trivial edits are answered
  directly; skills are used alone or chained only when the work calls for it.
- **Brainstorming in two methods:** compare approaches, then grill the design
  in rounds, for any open-ended topic. Glossary terms and ADRs are written here.
- **Planning** turns a settled goal into steps that each end in a checkable
  result, ordered by value, with a pre-mortem.
- **Debugging starts from a loop that shows the failure** (a reproduction, or
  an evidence timeline for a system you cannot re-run) before any hypothesis,
  and ends with a control against recurrence.
- **A floor, not a ceiling.** Subagent dispatches name a tier (`cheap`,
  `standard`, `session`, `top`) that never resolves below your session's model
  for work you rely on; every hard rule states its reason.
- **A guard hook** asks before a tool touches `.env`, keys, or certificates or
  scans `dist` or `build` broadly, and blocks whole-folder scans of
  `node_modules`. A convenience, not a security boundary; start Claude Code with
  `LEGION_GUARD=off` to disable it.
- **Measured, and honest about it.** Trigger evals run in CI; behavioral evals
  (`claude plugin eval`) and what they do not show are described in
  [docs/evals.md](docs/evals.md).

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

**Upgrading from 0.x:** 1.0.0 renames `using-legion` to `router`,
`writing-plans` to `planning`, and `systematic-debugging` to `debugging`, and
removes `executing-plans`, `code-review`, and `principles`. See
[CHANGELOG.md](CHANGELOG.md).

## Documents

| Document | Location |
|---|---|
| Design doc | `.legion/specs/YYYY-MM-DD-<topic>-design.md` |
| Plan | `.legion/plans/YYYY-MM-DD-<topic>.md` |
| Decision records | `docs/adr/NNNN-*.md` |

In your repo `specs/` and `plans/` are committed and the rest of `.legion/` is
gitignored. Legion's own repo ignores all of it.

## Skills

| Skill | Use for |
|---|---|
| `router` | Picks the skill for the work; injected at SessionStart |
| `brainstorming` | Any open-ended topic: intent, approaches, grilling, design doc, ADRs, glossary |
| `planning` | A settled goal to a step-by-step plan, ordered by value, with a pre-mortem |
| `debugging` | Root cause of a problem in any system, with a control against recurrence |
| `skill-creator` | Creating and validating skills against agentskills.io |

## Development

```bash
npm test                 # validate + validate:spec + trigger evals + hook, script, and shellcheck tests
npm run validate         # repo structure: links, router, README, manifests, versions
npm run validate:spec    # skills against agentskills.io (needs python3)
npm run evals:triggers   # vocabulary routing (TF-IDF)
claude plugin validate . --strict
claude plugin eval . --no-publish --model sonnet --threshold 0.66 -j 3   # behavioral, costs tokens
```

Contributor rules: [AGENTS.md](AGENTS.md). Open work: [docs/roadmap.md](docs/roadmap.md).

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY.md](THIRD_PARTY.md).
