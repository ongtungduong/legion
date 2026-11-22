---
name: router
description: >-
  Legion's router: which Legion skill fits which piece of work, and the
  precedence between user instructions, skills, and defaults. Injected at
  session start.
license: MIT
disable-model-invocation: true
metadata:
  author: ongtungduong
---

# Legion Router

Legion is a set of general-purpose working skills, for any kind of work.
Read what the work is, pick the skill whose method fits it, load it with the
Skill tool, and follow it. There is no fixed sequence: a skill is used alone
or chained only when the work calls for it.

## Workflow

1. **Apply precedence.** The user's instructions (CLAUDE.md, AGENTS.md, direct
   requests) win over any Legion skill; a loaded Legion skill wins over your
   default habits. A request to skip a safety step ("skip the check", "just
   add a retry") still loads the skill: keep the cheap control, say why in
   one line, and drop it only if the user insists after seeing that.
2. **Classify the work.**
   - Question, explanation, or a trivial edit: do it directly. No skill, no
     announcement. "What broke?" or "why does this keep happening?" is a
     problem to investigate, not a question.
   - Matches a row in the map: load that skill before acting, say so in one
     line ("Using legion:planning to lay out the steps"), and follow it.
   - Unsure: load the skill only if following it would change your next action.
3. **Chain only on need.** When one skill's result is the input of another
   (a settled direction that now needs steps, an investigation whose fix is
   large), offer the next skill; do not run a sequence by default.
4. **Keep loaded rules intact.** Routing decides *whether* a skill applies,
   never how strictly. A loaded skill is followed in full.

## Map

| Situation | Skill |
|---|---|
| Any open-ended topic whose direction is not settled: what to do and why, options and a recommendation, "help me think this through"; "grill me" or stress-test an idea; recording a decision (ADR); fuzzy or contested terms, GLOSSARY.md | `legion:brainstorming` |
| A settled goal, approved design, or clear requirements that need a detailed step-by-step plan to get the work done | `legion:planning` |
| Something in a system behaves wrongly and the cause is unknown: an error, failure, outage, mismatch, slowdown, or recurring problem; "what broke?", "why is this happening?" | `legion:debugging` |
| Creating, editing, or validating a skill | `legion:skill-creator` |

## Model tiers

A skill that dispatches a subagent names a tier, never a model. Set `model` from
this table; a tier never resolves below the model of this session for work whose
verdict the user relies on.

| Tier | For | `model` |
|---|---|---|
| `cheap` | lookups with no judgment: find files, run commands, read logs | `haiku` |
| `standard` | reading material at volume: finders, reviewers, checkers | `sonnet` |
| `session` | work the main session builds on | omit `model`: it inherits this session's |
| `top` | verdicts the user relies on: verification at depth | `opus`, or a more capable model the Agent tool lists, never below this session's |

If the Agent tool's list changes, keep the tiers and name the alias you chose.

## Gotchas

- Plugin skills are namespaced: load `legion:planning`, not `planning`.
- Skills change between versions. Load the skill instead of working from your
  memory of it.
- No domain is the default. Code is one kind of work among many; a strategy,
  a process, or an operations problem gets the same skills.
- Another plugin may inject its own router with skills of the same names.
  Follow the user's instruction about which to use; without one, use Legion's
  and mention the overlap once.
