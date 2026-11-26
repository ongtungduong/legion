# Legion

A plugin of working skills for Claude Code. Legion gives the agent a
method for the kinds of work that go wrong when improvised: deciding what to
do, laying out how to get it done, building it checks first, finding why
something broke, and auditing its security. Six skills are general-purpose
and fit any kind of work: `brainstorming`, `finding-skills`, `planning`,
`creating-skills`, `optimizing-prompts`, and `orchestrating-subagents`. The others serve engineering work: software,
infrastructure, data, and security.

Based on [superpowers](https://github.com/obra/superpowers), with material from
[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) and
[mattpocock/skills](https://github.com/mattpocock/skills), and the security audit
from [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill). Origins:
[THIRD_PARTY.md](THIRD_PARTY.md), [docs/architecture.md](docs/architecture.md).

## What it does differently

- **Finds the right skill, not a pipeline.** `finding-skills` is injected at
  session start and picks the skill that fits the work, Legion's or any other
  skill installed on the machine, and combines a Legion method with a
  specific skill when both apply. Questions and trivial edits are answered
  directly; skills are used alone or chained only when the work calls for it.
- **Brainstorming in two methods:** compare approaches, then grill the design
  in rounds, for any open-ended topic, through six thinking lenses.
- **Planning, then orchestration.** `planning` breaks a settled goal, in any
  domain, into small concrete tasks: each with what it produces, its inputs,
  what it depends on, what may run beside it, and a checkable done line,
  worked back from the done state with a pre-mortem. For software it reads
  the repo (commands, real paths, deploy style) and keeps every step green
  with staged rollouts. `orchestrating-subagents` then decides how those
  tasks run: inline or on subagents, on which tier and effort, in which
  parallel group, with every result verified.
- **STDD** (Specification & Test-Driven Development) writes what must stay
  true next to what changes, makes each line a check, and shows the new checks
  failing before the change.
- **Debugging starts from a loop that shows the failure** (a reproduction, or
  an evidence timeline for a system you cannot re-run) before any hypothesis,
  and ends with a control against recurrence.
- **Security audits that separate proof from suspicion.** `auditing-security`
  hunts by a coverage ledger with isolated subagents, gives every candidate to
  a fresh verifier that tries to disprove it, runs target code only in a
  sandbox, and reports `confirmed` findings with severity apart from
  `needs_validation` leads that name the missing fact. Questions get guidance
  without files; a full audit writes a validated `findings.json` and reports
  outside the repo.
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
the SessionStart hook injects `finding-skills` and the skills appear as
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

**Upgrading from 0.x:** 1.0.0 renames `using-legion` to `finding-skills`,
`writing-plans` to `planning`, and `systematic-debugging` to `debugging`, and
removes `executing-plans`, `code-review`, and `principles`. See
[CHANGELOG.md](CHANGELOG.md).

## Documents

| Document | Location |
|---|---|
| Design doc | `.legion/specs/YYYY-MM-DD-<topic>-design.md` |
| Plan | `.legion/plans/YYYY-MM-DD-<topic>.md` |
| Spec | `.legion/specs/YYYY-MM-DD-<topic>-spec.md` |

In your repo `specs/` and `plans/` are committed and the rest of `.legion/` is
gitignored. Legion's own repo ignores all of it.

## Skills

| Skill | Purpose | Use for |
|---|---|---|
| `finding-skills` | General-purpose | Finds the best skill for the work, Legion's or any installed; injected at SessionStart |
| `brainstorming` | General-purpose | Any open-ended topic: intent, approaches, grilling, design doc, thinking lenses |
| `planning` | General-purpose | A settled goal to small concrete tasks in dependency order, each with inputs, dependencies, and a done check, worked back from the done state, pre-mortem; for software, read from the repo with each step green and staged rollouts |
| `creating-skills` | General-purpose | Creating and validating skills against agentskills.io |
| `optimizing-prompts` | General-purpose | User-invoked (`/legion:optimizing-prompts <prompt>`): rewrites a rough prompt for Claude per Anthropic's prompting best practices, with every added assumption listed |
| `orchestrating-subagents` | General-purpose | How tasks run, the tasks of a plan or a fan-out: a tier and effort per piece by the cost of a wrong answer, self-contained briefs, parallel dispatch, verified results, escalation; multi-model setups from Anthropic's model-selection guidance |
| `implementing-stdd` | Engineering | Building to a spec: criteria (new, unchanged, my calls) as checks, red before green, spec kept current |
| `debugging` | Engineering | Root cause of a problem in software, infrastructure, or data, with a control against recurrence |
| `auditing-security` | Engineering | Security guidance, or a full audit: coverage ledger, isolated hunters, independent verifiers, validated findings and reports |

## Development

```bash
npm test                 # validate + validate:spec + trigger evals + hook, script, and shellcheck tests
npm run validate         # repo structure: links, finding-skills map, README, manifests, versions
npm run validate:spec    # skills against agentskills.io (needs python3)
npm run evals:triggers   # vocabulary routing (TF-IDF)
claude plugin validate . --strict
claude plugin eval . --no-publish --model sonnet --threshold 0.66 -j 3   # behavioral, costs tokens
```

Contributor rules: [AGENTS.md](AGENTS.md). Open work: [docs/roadmap.md](docs/roadmap.md).

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY.md](THIRD_PARTY.md).
