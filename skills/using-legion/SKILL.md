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
| New work or a behavior change whose design is not approved: intent, approaches, design doc; "grill me"; recording an ADR | `legion:brainstorming` |
| Fuzzy or contested terms; GLOSSARY.md | `legion:defining-terms` |
| An approved spec needs an implementation plan | `legion:writing-plans` |
| Any production code change, with or without a plan; about to claim done, commit, or open a PR | `legion:executing-plans` |
| Bug, failing or flaky test, crash, performance regression | `legion:systematic-debugging` |
| Reviewing a diff, branch, or PR; responding to review feedback | `legion:code-review` |
| Refactoring or cleanup; untested legacy code; designing a module, API, boundary, domain model, data flow, or failure handling | `legion:coding-principles` |
| Untrusted input, auth, secrets, personal data, or LLM output | `legion:security-and-hardening` |
| Speeding up code toward a measured goal: profiling, N+1, latency, throughput, memory, bundle size, Core Web Vitals | `legion:performance-optimization` |
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
