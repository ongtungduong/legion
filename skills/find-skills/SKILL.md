---
name: find-skills
description: >-
  Finds the skill that best fits the work, Legion's or any other skill
  installed on this machine, and sets the precedence between user
  instructions, skills, and defaults. Injected at session start.
license: MIT
disable-model-invocation: true
metadata:
  author: ongtungduong
---

# Find Skills

Legion is a set of general-purpose working skills, for any kind of work, and
it is rarely the only set installed. Read what the work is, find the skill
whose method or knowledge fits it best, whether it is Legion's or another
skill this session lists, load it with the Skill tool, and follow it. There is
no fixed sequence: a skill is used alone or combined only when the work calls
for it.

## Workflow

1. **Apply precedence.** The user's instructions (CLAUDE.md, AGENTS.md, direct
   requests) win over any skill; a loaded skill wins over your default habits.
   A request to skip a safety step ("skip the check", "just add a retry")
   still loads the skill: keep the cheap control, say why in one line, and
   drop it only if the user insists after seeing that.
2. **Classify the work.**
   - Question, explanation, or a trivial edit: do it directly. No skill, no
     announcement. "What broke?" or "why does this keep happening?" is a
     problem to investigate, not a question.
   - Otherwise, find candidates in step 3.
   - Unsure: load a skill only if following it would change your next action.
3. **Find the best fit among every listed skill.** Candidates are the map below
   plus every skill in this session's skill list: other plugins, the user's
   skills, and the project's skills. Judge each by its description, not its
   name. Rank them this way:
   - **Specific beats general for its part.** A skill made for the exact file
     format, tool, service, or the user's own organization or domain (a
     house checklist, a team's dossier review) carries facts no general method
     does. It owns the part of the work it names.
   - **Method and specifics combine.** When the work is to decide, plan, or find
     a cause, the Legion method sets the approach and a specific skill supplies
     the facts: debugging a broken container build is `legion:debugging` plus
     the container skill. Load the one that governs your next action first and
     the other when its step comes.
   - **Two skills for the same job** (another plugin's skill-creator next to
     `legion:skill-creator`): follow the user's instruction; else the one the
     project's docs name; else Legion's for Legion's kinds of work and the
     more specific one otherwise. Mention the overlap once.
   - **Skip** skills whose description calls them internal helpers of another
     plugin, and skills that require an environment this session lacks
     (a cloud-only skill in a local session).
   - **No fit:** work without a skill. Do not stretch a skill's description to
     cover work it was not written for.
4. **Announce in one line** which skill or skills and why ("Using
   legion:debugging, with docker-skills:docker-compose-patterns for the
   compose file"), then follow them.
5. **Search the disk only on request.** When the user asks whether a skill
   exists for something, asks you to find one, or names a skill that is not in
   your list, look beyond the list as described in Skills on disk below. A
   routine task never triggers the search:
   the list already holds every enabled skill.
6. **Chain only on need.** When one skill's result is the input of another (a
   settled direction that now needs steps, an investigation whose fix is
   large), offer the next skill; do not run a sequence by default.
7. **Keep loaded rules intact.** Finding decides *whether* a skill applies,
   never how strictly. A loaded skill is followed in full.

## Map

The Legion skills, by kind of work. Any other listed skill is a candidate too.

| Situation | Skill |
|---|---|
| Any open-ended topic whose direction is not settled: what to do and why, options and a recommendation, "help me think this through"; "grill me" or stress-test an idea; first principles, inversion, six hats, systems, second-order, impact/effort | `legion:brainstorming` |
| A settled goal, approved design, or clear requirements that need a detailed step-by-step plan to get the work done | `legion:planning` |
| Something in a system behaves wrongly and the cause is unknown: an error, failure, outage, mismatch, slowdown, or recurring problem; "what broke?", "why is this happening?" | `legion:debugging` |
| Creating, editing, or validating a skill | `legion:skill-creator` |

## Skills on disk

Installed skills that your list lacks are either user-invoked
(only the user can start them, so the model never sees them) or belong to
a disabled plugin. Read only frontmatter, never whole skill folders:

```bash
find ~/.claude/skills .claude/skills -maxdepth 2 -name SKILL.md \
  -exec grep -H -A4 '^description:' {} + 2>/dev/null
find ~/.claude/plugins/cache -mindepth 3 -maxdepth 3 -type d   # <marketplace>/<plugin>/<version>
```

In the plugin cache, read only the newest version folder of each plugin; older
ones stay behind after updates. Report what you found and how to use it: a
user-invoked skill runs when the user types `/<name>`; a disabled plugin's
skill needs `claude plugin enable <plugin>@<marketplace>` and a new session.
Do not read and follow such a skill on your own: it was kept out of your list
on purpose, by its author or by the user.

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

## Output format

When the user asks which skills fit a piece of work, answer without loading
any, best fit first:

| Skill | Why it fits | Source |
|---|---|---|
| `<plugin>:<name>` or `<name>` | the part of the work it covers | Legion, plugin `<name>`, user, project, or disk (not enabled) |

## Gotchas

- Plugin skills are namespaced: load `legion:planning`, not `planning`.
- Skills change between versions. Load the skill instead of working from your
  memory of it.
- No domain is the default. Code is one kind of work among many; a strategy,
  a process, or an operations problem gets the same skills.
- A skill's name can mislead: `code-review` in one plugin may only review a
  diff, in another audit a whole repo. The description decides.
- Another plugin may inject its own router with skills of the same names.
  Follow the user's instruction about which to use; without one, use Legion's
  and mention the overlap once.
