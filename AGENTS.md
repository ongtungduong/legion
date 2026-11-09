# Legion: contributor guide

Rules for anyone, human or agent, changing this repo.

## Layout

```
.claude-plugin/   plugin.json + marketplace.json (versions must match package.json)
hooks/            hooks.json + session-start (injects skills/using-legion)
skills/<name>/    SKILL.md (+ references/, assets/, scripts/) - shipped to users
evals/triggers/   lexical trigger cases, one JSON per skill
evals/plugin/     behavioral cases for `claude plugin eval` (prompt.md + graders/)
scripts/          repo checks (Node, no dependencies)
tests/            shell tests for hooks
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

- Everything is in English: skill content and docs for humans (`README.md`, `docs/`).
- Cross-skill instructions say "Call the Skill tool with `legion:<name>`".
- Subagents start with a fresh context and an explicitly named model.
- Generated artifacts go under `docs/legion/` (specs, plans) and `.legion/` (scratch).
- The router stays light: it never forces a skill onto a question or trivial edit.
- Nothing under `skills/` may be skill-development material (`test-*.md`,
  `*.scenario.md`, `CREATION-LOG.md`): agents read those folders during real work.
- `SKILL.md` stays under 20,000 bytes: after compaction Claude Code re-attaches
  only that much of an invoked skill.
- A user-invoked skill (only the human can start it) adds
  `disable-model-invocation: true` (Claude Code extension) and gets a one-line
  human-facing description.

## Adding or renaming a skill

- [ ] `skills/<name>/` written with `legion:skill-creator`
- [ ] Row in the map in `skills/using-legion/SKILL.md`
- [ ] Row in the skill table in `README.md`
- [ ] `evals/triggers/<name>.json` with 3+ positive and 2+ near-miss negative prompts
- [ ] Provenance in `THIRD_PARTY.md` if adapted from another project
- [ ] `npm test` and `claude plugin validate . --strict` pass

## Checks

```bash
npm test                            # all of the below except plugin validate
npm run validate                    # repo: links, legion: refs, router/README coverage, versions, hook
npm run validate:spec               # every skill against agentskills.io (needs python3)
npm run evals:triggers              # lexical routing; fails on near-duplicate descriptions
claude plugin validate . --strict
claude plugin eval . --no-publish  # behavioral, on demand, costs tokens
```

When a description changes, re-run `npm run evals:triggers`. When you measure
real trigger rates, record the model and Claude Code version.
