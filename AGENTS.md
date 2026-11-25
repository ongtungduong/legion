# Legion: contributor guide

Rules for anyone, human or agent, changing this repo.

## Layout

```
.claude-plugin/   plugin.json + marketplace.json (versions must match package.json)
hooks/            hooks.json, session-start (injects skills/find-skills), guard (PreToolUse)
skills/<name>/    SKILL.md (+ references/, assets/, scripts/) - shipped to users
evals/triggers/   lexical trigger cases, one JSON per skill
evals/plugin/     behavioral cases for `claude plugin eval` (prompt.md + graders/, or case.yaml + fixture.sh)
evals/grader-kinds.json  every non-routing grader declared `lift`, `guard`, or `protocol`
scripts/          repo checks (Node, no dependencies)
tests/            hook tests (shell), check and validator tests (node:test)
docs/             architecture, roadmap (human-facing)
```

## Writing or changing a skill

Load `legion:skill-creator` and follow its workflow. Every skill conforms to the
[agentskills.io specification](https://agentskills.io/specification):

- Frontmatter: `name` (equals the directory), `description`, `license: MIT`,
  `metadata.author`. Use a folded `description: >-` block as in
  `skills/skill-creator/assets/SKILL-template.md`.
- `description` states **what** the skill does, then **when** to use it
  ("Use when ..."), with the phrasings users actually type, including the
  cases where the model thinks it can manage alone ("even when the code is
  pasted inline").
- Body: what the agent lacks, not what it knows. Default structure is
  Workflow / Gotchas / Output format. Hard rules state their reason; no
  ALL-CAPS directives.
- Every mention of a bundled file says when to read it and uses a path relative
  to the skill root, one level deep. Long templates live in `assets/`.

Legion conventions on top of the spec:

- Every skill serves one of two purposes. **General-purpose**:
  `brainstorming`, `find-skills`, `skill-creator`, `prompt-optimization`; each names no domain (code
  included) as its default, and its domain examples belong in evals.
  **Engineering** (software, infrastructure, data, security): `planning`,
  `std-development`, `debugging`, `security-audit`; each may name engineering
  artifacts (tests, builds, deploys, queries) but no single language or stack
  as its default.
- Everything is in English: skill content and docs for humans (`README.md`, `docs/`).
- Cross-skill instructions say "Call the Skill tool with `legion:<name>`".
- Subagents start with a fresh context and an explicitly named tier
  (`cheap`, `standard`, `session`, `top`, defined in `skills/find-skills/SKILL.md`),
  never a model alias: a pinned alias caps later sessions at today's best model.
- A rule that cannot serve a case needs an exit, stated with its reason. A rule
  that stops changing outcomes on the newest model is a cut candidate
  (`skills/skill-creator/references/measuring.md`).
- Generated artifacts go under `.legion/`: `specs/` and `plans/` are committed in a repo that uses Legion, everything else (`runs/`, scratch) is gitignored. Legion's own repo ignores all of `.legion/`.
- `find-skills` stays light: it never forces a skill onto a question or trivial edit.
- Nothing under `skills/` may be skill-development material (`test-*.md`,
  `*.scenario.md`, `CREATION-LOG.md`): agents read those folders during real work.
- `SKILL.md` stays under 20,000 bytes: after compaction Claude Code re-attaches
  only that much of an invoked skill.
- A user-invoked skill (only the human can start it) adds
  `disable-model-invocation: true` (Claude Code extension) and gets a one-line
  human-facing description.

## Adding or renaming a skill

- [ ] Its purpose, general-purpose or engineering, confirmed with the
      maintainer before writing it, never inferred from the draft, and added
      to the purpose list under "Legion conventions"

- [ ] `skills/<name>/` written with `legion:skill-creator`
- [ ] Row in the map in `skills/find-skills/SKILL.md`
- [ ] Row in the skill table in `README.md`
- [ ] `evals/triggers/<name>.json` with 5+ positive and 2+ near-miss negative prompts
- [ ] `evals/plugin/<name>-<behavior>/` and `evals/plugin/<name>-stays-quiet-<prompt>/` cases, every non-routing grader declared in `evals/grader-kinds.json` before the first run (`lift`: an outcome the plugin should improve; `guard`: an outcome the baseline reaches too; `protocol`: Legion's own format)
- [ ] Provenance in `THIRD_PARTY.md` if adapted from another project
- [ ] `npm test` and `claude plugin validate . --strict` pass

## Checks

```bash
npm test                            # all of the below except plugin validate
npm run validate                    # repo: links, legion: refs, find-skills/README coverage, versions (bumped since the latest tag), hook, eval case structure
npm run validate:spec               # every skill against agentskills.io (needs python3)
npm run evals:triggers              # lexical routing; fails on near-duplicate descriptions
npm run test:shell                  # shellcheck (skipped locally if not installed, required in CI)
claude plugin validate . --strict
claude plugin eval . --no-publish  # behavioral, on demand, costs tokens
npm run evals:summarize -- <result.json> <label>  # commit a per-case summary of a run
```

A new check rule gets a row in the rule tables of `tests/scripts/validate.test.mjs`.

When a description changes, re-run `npm run evals:triggers`. When you measure
real trigger rates, record the model and Claude Code version.
