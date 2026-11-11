---
name: skill-creator
description: >-
  Creates, reviews, fixes, and validates Agent Skills that conform to the
  agentskills.io specification. Use whenever the user wants to create a new
  agent skill, write or edit a SKILL.md, turn a workflow, prompt, or
  documentation into a reusable skill, restructure an oversized skill, or
  check a skill against the spec, even if they just say "make a skill for X"
  or mention agentskills.io, skill folders, or SKILL.md.
license: MIT
metadata:
  author: ongtungduong
---

# Agent Skills Creator

Create agent skills that conform to the [agentskills.io specification](https://agentskills.io/specification). A skill is a directory containing a `SKILL.md` file (YAML frontmatter + Markdown instructions), optionally bundling `scripts/`, `references/`, and `assets/`.

## Workflow

Follow these steps in order. Steps 1-2 shape everything else; without them a skill restates what the agent already does.

### 1. Capture intent

Before writing anything, establish:

- **What** should the skill enable? One coherent unit of work: too narrow forces several skills to load per task; too broad activates imprecisely.
- **When** should it trigger? Collect the phrases and contexts a real user would type.
- **What context does the agent lack?** Project conventions, specific APIs, non-obvious gotchas, exact command sequences. That is the skill's whole value.

If the conversation contains a worked example ("turn this into a skill"), mine it: the steps that worked, the user's corrections, input/output formats, and context the user had to supply. Ask the user to fill gaps rather than inventing generic filler.

### 2. Measure the baseline

Before writing or changing a skill's instructions, run 2-3 realistic task prompts without the skill (or without the change) and record what the agent gets wrong. Those observed failures are the skill's spec: write only what fixes them; if there are none, the skill adds no value. Add one near-miss prompt that shares the skill's vocabulary but belongs elsewhere, where the skill must stay quiet.

In a Claude Code plugin repo, each prompt is a `claude plugin eval` case folder (`prompt.md` + `graders/`) and the without-plugin arm (or a run before the change) is the baseline; elsewhere, use a fresh subagent that cannot see the draft. Read [references/measuring.md](references/measuring.md) when setting up the cases, graders, or comparison.

### 3. Design the structure

Decide what goes where using progressive disclosure (three loading levels):

| Level | What | Budget |
|---|---|---|
| 1. Metadata | `name` + `description`, always in context | ~100 tokens |
| 2. Instructions | `SKILL.md` body, loaded on activation | spec: < 5000 tokens, < 500 lines; Claude Code: < 20,000 bytes |
| 3. Resources | `scripts/`, `references/`, `assets/`, loaded or run on demand | unlimited |

The byte limit is a Claude Code fact: after compaction it re-attaches only the first 20,000 bytes of an invoked skill.

- Core workflow, defaults, and gotchas go in `SKILL.md`.
- Detailed material goes in `references/`, one file per domain or variant, so the agent reads only what is relevant.
- Deterministic logic the agent would rewrite on every run goes in `scripts/`.
- Templates and static files the output needs go in `assets/`.
- Every mention of a bundled file says **when** to load it ("Read the API-errors reference if the API returns a non-200 status"), uses a path relative to the skill root, and stays one level deep, with no chains of references.

### 4. Write the frontmatter

When scaffolding a brand-new skill, copy [assets/SKILL-template.md](assets/SKILL-template.md) into `<skill-name>/SKILL.md` and replace the bracketed placeholders.

Read [references/specification.md](references/specification.md) before writing frontmatter for the first time in a session. The two required fields:

- **`name`**: 1-64 chars, only unicode lowercase letters, digits, and hyphens; must not start or end with a hyphen or contain `--`; **must equal the skill's directory name**, or loaders and the validator reject it.
- **`description`**: 1-1024 chars, written as a folded `>-` block. It states *what the skill does*, then *when to use it*, with the concrete keywords a user's request would contain. It is the only text seen when deciding to activate, so make it pushy: list trigger phrases, file types, and situations, including those where the model thinks it can manage alone. "Helps with PDFs" fails; "Extracts text and tables from PDF files, fills forms, merges PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction" passes.

Optional fields: `license`, `compatibility` (≤500 chars, only for real environment requirements), `metadata` (string-to-string map, e.g. author), `allowed-tools` (experimental).

### 5. Write the body

The default structure is Workflow / Gotchas / Output format. Read [references/best-practices.md](references/best-practices.md) when writing a body of any complexity; it has before/after examples for these principles:

- **Fix the observed failures, omit what the agent knows.** For each paragraph ask: "Would the agent get this wrong without it?" The baseline answers that; if no, cut it.
- **Calibrate control to fragility.** Where many approaches work, explain the *why*. Where a sequence is fragile, be exact ("Run exactly this command; do not add flags").
- **Provide defaults, not menus.** Pick one tool or approach; mention alternatives only as an escape hatch for named cases.
- **Teach procedures, not answers.** Instructions should generalize to the whole class of tasks, not solve one instance.
- **State the reason for every hard rule**; ALL-CAPS emphasis does not replace one.
- **Use the proven patterns where they fit:** Gotchas for facts that defy assumptions; output templates instead of prose; checklists; validate-fix-repeat loops; plan-validate-execute for batch or destructive operations.

If the skill bundles executable code, read [references/scripts-guide.md](references/scripts-guide.md) for making scripts self-contained, non-interactive, and agent-friendly.

### 6. Validate

Run the bundled validator on the finished skill directory:

```bash
python scripts/validate_skill.py <path-to-skill-directory>
```

It checks every frontmatter constraint from the spec and warns on a body over 500 lines, a `SKILL.md` of 20,000 bytes or more, and referenced bundled paths that do not exist. Fix all errors and review every warning. `skills-ref validate <dir>`, where available, is an equivalent check.

### 7. Review with fresh eyes, then re-measure

Reread the draft as an agent seeing it cold, mid-task, with a full context window:

- Does the description alone tell you when to activate?
- Can you execute the workflow without asking questions the SKILL.md should have answered?
- Invert the trigger: would the description claim the step 2 near-miss, or another prompt that shares its vocabulary but belongs to another skill or none?

Then re-run the step 2 prompts with the skill and compare against the baseline. A fixed failure confirms its instruction; an instruction that shows no delta is a candidate to cut. Wasted agent turns usually mean instructions are vague, inapplicable, or offer too many options.

## Gotchas

- A description in a plain YAML scalar breaks on any `: ` inside it ("Use when: ..."); the folded `>-` block does not.
- Nothing under a shipped skill folder may be skill-development material (test scenarios, creation logs, eval prompts): agents read those folders during real work and follow what they find. Keep it outside, e.g. in `evals/`.
- Plugin skills are namespaced (`<plugin>:<skill>`): a cross-skill reference by bare name can miss or hit another plugin's skill. A link into another skill's folder breaks when skills install separately.
- A skill only the human should start needs `disable-model-invocation: true` (a Claude Code extension; the spec validator's unknown-field warning is expected) and a one-line human-facing description.

## Output checklist

Before delivering a skill, confirm:

- [ ] Directory name == `name` frontmatter field
- [ ] `description` is a folded block stating what + when, with trigger keywords
- [ ] Baseline failures recorded, instructions trace to them, and the re-run shows the delta
- [ ] `SKILL.md` body under 500 lines and 20,000 bytes; overflow moved to `references/`
- [ ] Every bundled-file mention says when to load it and uses a relative path
- [ ] Scripts (if any) are non-interactive, self-contained, with helpful errors
- [ ] `python scripts/validate_skill.py <dir>` passes with no errors
- [ ] In a repo that keeps a thinking-model matrix, its row for this skill is updated
