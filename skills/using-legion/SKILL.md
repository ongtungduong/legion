---
name: using-legion
description: >-
  Routes each task to the right Legion skill and sets the precedence between
  user instructions, skills, and defaults. Use at the start of every session
  and whenever a request involves building, planning, implementing, testing,
  debugging, reviewing, securing, or finishing work, to decide which Legion
  skill to load, if any.
license: MIT
metadata:
  author: ongtungduong
---

# Using Legion

Pick the Legion skill a task needs, load it with the Skill tool, and follow
it. Questions and trivial edits get answered directly, with no skill.

## Workflow

1. **Apply precedence.** The user's instructions (CLAUDE.md, AGENTS.md, direct
   requests) win over any Legion skill; a loaded Legion skill wins over your
   default habits.
2. **Classify the request.**
   - Question, explanation, or trivial edit that changes no code behavior
     (typo, comment, docs, formatting): do it directly. No skill, no
     announcement.
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
| Building something new or changing behavior before any design is approved: clarifying intent, choosing between approaches or tools, or writing the design, even when the user already explained what and why; or a plan, decision, or idea to stress-test ("grill me"); or a decision to record as an ADR | `legion:brainstorming` |
| Project vocabulary is fuzzy, or a term or GLOSSARY.md is being decided | `legion:defining-terms` |
| An approved spec or design needs an implementation plan | `legion:writing-plans` |
| Writing or changing production code, with or without a plan: a feature, a fix, a limit or rule, a pasted function, missing tests; or about to say code work is done, commit, or open a PR | `legion:executing-plans` |
| A bug, failing test, crash, flaky behavior, or performance regression | `legion:systematic-debugging` |
| Reviewing a diff, branch, or PR, or responding to review feedback | `legion:code-review` |
| Refactoring, cleaning up, or making code readable; changing untested legacy code; designing a module, API, architecture boundary, domain model, data flow, or failure handling | `legion:coding-principles` |
| Code touches untrusted input, auth, secrets, personal data, or LLM output | `legion:security-and-hardening` |
| Creating, editing, or validating a skill | `legion:skill-creator` |

## Default flow for new work

```
brainstorming ─▶ writing-plans ─▶ executing-plans ─▶ code-review (final)
     │                                  │
     └─ defining-terms                  └─ spec + TDD + coding-principles + evidence gate in every task,
                                           inline or subagent per task
```

Scale it to the work and say which size you chose: a small change collapses
brainstorming into one short confirmation and may skip the written plan; a
trivial change skips the flow.

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
