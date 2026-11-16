---
name: using-legion
description: >-
  Legion's router: which Legion skill fits which task, and the precedence
  between user instructions, skills, and defaults. Injected at session start.
license: MIT
disable-model-invocation: true
metadata:
  author: ongtungduong
---

# Using Legion

Pick the Legion skill a task needs, load it with the Skill tool, and follow
it. Questions and trivial edits get answered directly, with no skill.

## Workflow

1. **Apply precedence.** The user's instructions (CLAUDE.md, AGENTS.md, direct
   requests) win over any Legion skill; a loaded Legion skill wins over your
   default habits. A request to skip a safety step ("skip the validation",
   "just add a retry", "skip the test") still loads the skill: keep the
   cheap control, say why in one line, and drop it only if the user insists
   after seeing that.
2. **Classify the request.**
   - Question, explanation, or trivial edit that changes no code behavior
     (typo, comment, docs, formatting): do it directly. No skill, no
     announcement. "What broke?" or "why does this fail?" is a bug, not a
     question.
   - Any change to what code does, however small or fully specified: load
     `legion:executing-plans`. A one-line fix still gets its failing test.
   - Matches a row in the map below: load that skill before acting, say so in
     one line ("Using legion:writing-plans to break this down"), follow it.
   - Unsure: load the skill only if following it would change your next action.
3. **Keep loaded rules intact.** Routing decides *whether* a skill applies,
   never how strictly. A loaded discipline skill (executing-plans,
   systematic-debugging) is followed in full.

## Map

| Situation | Skill |
|---|---|
| New work or a behavior change whose design is not approved: intent, approaches, design doc; "grill me"; recording an ADR; fuzzy or contested terms, GLOSSARY.md | `legion:brainstorming` |
| An approved spec needs an implementation plan | `legion:writing-plans` |
| Any production code change, with or without a plan; about to claim done, commit, or open a PR | `legion:executing-plans` |
| Bug, failing or flaky test, crash, performance regression | `legion:systematic-debugging` |
| Reviewing a diff, branch, or PR; responding to review feedback; a security question about code ("is this safe?"), a security audit, pen-test, or vulnerability hunt; auditing a whole repo (no diff) for system design, performance, or security, or with no axis named | `legion:code-review` |
| Designing a module, API, boundary, domain model, data flow, or failure handling; refactoring, cleanup, or untested legacy code; making code faster toward a measured goal (N+1, latency, memory, bundle size, Core Web Vitals); code that crosses a trust boundary: untrusted input, auth, secrets, personal data, LLM output | `legion:principles` |
| Creating, editing, or validating a skill | `legion:skill-creator` |

## Default flow for new work

```
brainstorming ─▶ writing-plans ─▶ executing-plans ─▶ code-review (final)
                                        ├─ unexpected failure ─▶ systematic-debugging ─▶ back to the task
                                        └─ spec + TDD + principles (design, code, performance, security) + evidence gate in every task,
                                           inline or subagent per task
```

Scale it to the work and say which size you chose: a small change collapses
brainstorming into one short confirmation and may skip the written plan; a
trivial change skips the flow. A bug report enters at systematic-debugging,
whose fix then runs through executing-plans.

## Model tiers

A skill that dispatches a subagent names a tier, never a model. Set `model` from
this table; a tier never resolves below the model of this session for work whose
verdict the user relies on.

| Tier | For | `model` |
|---|---|---|
| `cheap` | lookups with no judgment: find files, run tests, read logs | `haiku` |
| `standard` | reading code at volume: finders, hunters, auditors, task reviewers | `sonnet` |
| `session` | work the main session builds on: implementers, a lone verifier | omit `model`: it inherits this session's |
| `top` | verdicts: verification at depth, risky-task review, doubt review | `opus`, or a more capable model the Agent tool lists, never below this session's |

If the Agent tool's list changes, keep the tiers and name the alias you chose.

## Gotchas

- Plugin skills are namespaced: load `legion:executing-plans`, not
  `executing-plans`.
- Skills change between versions. Load the skill instead of working from your
  memory of it.
- Another workflow plugin (for example superpowers) may inject its own router
  with skills of the same names. Follow the user's instruction about which to
  use; without one, use Legion's and mention the overlap once.
- "I'll add tests after", "it should work now", and "let me try a quick fix"
  are the exact moments executing-plans and systematic-debugging exist for.
- Any claim that work is done, code or not, needs a check run in that message
  and its output; what you could not check is unverified, not done.
