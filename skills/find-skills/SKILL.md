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

Legion is a set of engineering skills (software, infrastructure, data,
security) plus general-purpose skills for any kind of work
(`legion:brainstorming`, `legion:planning`, `legion:skill-creator`,
`legion:subagent-orchestration`, and this one), and it is
rarely the only set installed. Read what the work is, find the skill
whose method or knowledge fits it best, whether it is Legion's or another
skill this session lists, load it with the Skill tool, and follow it. There is
no fixed sequence: a skill is used alone or combined only when the work calls
for it.

## Workflow

1. **Apply precedence.** The user's instructions (CLAUDE.md, AGENTS.md, direct
   requests) win over any skill; a loaded skill wins over your default habits.
   A request to skip a safety step ("skip the check", "no tests needed",
   "just add a retry") still loads the skill: keep the cheap control, say why in one line, and
   drop it only if the user insists after seeing that.
2. **Classify the work.**
   - Question, explanation, or a trivial edit: do it directly. No skill, no
     announcement. "What broke?" or "why does this keep happening?" is a
     problem to investigate, not a question, even when a pasted diff or error
     makes the cause look obvious: a cause seen at a glance is a hypothesis
     until a check shows it, so load the skill before you diagnose.
     A trivial edit changes no behavior (a typo, a rename, formatting); a
     request that changes what something does ("make it also handle X") is
     not trivial however short the code, since what it must keep doing is
     the part nobody wrote down.
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
     more specific one otherwise. Mention the overlap once. A skill the user's
     or project's instructions name but your list lacks is in
     `.claude/skills/<name>/SKILL.md`: read it, since naming it is the
     authorization and the alternative is one they told you not to use.
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
   your list, read `references/skills-on-disk.md` in this skill's folder
   (the session-start note names it) and follow it. A routine task never
   triggers the search: the list already holds every enabled skill.
6. **Chain only on need.** When one skill's result is the input of another (a
   settled direction that now needs steps, an investigation whose fix is
   large), offer the next skill; do not run a sequence by default.
7. **Keep loaded rules intact.** Finding decides *whether* a skill applies,
   never how strictly. A loaded skill is followed in full.

## Map

The Legion skills, by kind of work. Any other listed skill is a candidate too.

| Situation | Skill |
|---|---|
| Any open-ended topic, in any domain, whose direction is not settled: what to do and why, including "plan X" when no goal, spec, or design for X was agreed, options and a recommendation, "help me think this through"; "grill me" or stress-test an idea; first principles, inversion, six hats, systems, second-order, impact/effort | `legion:brainstorming` |
| A settled goal, approved spec or design, or clear requirements, in any domain, that needs breaking into small concrete tasks in dependency order ahead of the work (a feature, refactor, rollout, event, launch, process change) | `legion:planning` |
| Building to a spec or changing what something does: the new behavior and the behavior that must not change as checks, red before green; "TDD", "tests first" | `legion:std-development` |
| Security of code or a system: an audit or pen test, "find vulnerabilities", whether something is exploitable, triage or severity of a reported vulnerability | `legion:security-audit` |
| Something in software, infrastructure, or data behaves wrongly and the cause is unknown: an error, failure, outage, mismatch, slowdown, or recurring problem; "what broke?", "why is this happening?" | `legion:debugging` |
| Creating, editing, or validating a skill | `legion:skill-creator` |
| How tasks run once they exist: the tasks of an approved plan, or a fan-out, inline or on subagents, in any domain: "use subagents", "run the plan with agents", delegating verbose reading, dispatching agents together to research, review, or read documents; the model or effort for each agent or step; designing a multi-model agent setup | `legion:subagent-orchestration` |

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
- `legion:std-development`, `legion:debugging`, and `legion:security-audit`
  serve engineering work. A problem outside it (an event, a hire, a
  business process) gets `legion:brainstorming` while its direction is
  open, and otherwise none of them, since their methods assume tests,
  builds, and data the work does not have. `legion:planning`,
  `legion:subagent-orchestration`, and `legion:skill-creator` fit any kind
  of work.
- `legion:planning` breaks the work into tasks; `legion:subagent-orchestration`
  decides how those tasks run. A request to run an approved plan with agents
  loads the second, not a new plan.
- A skill's name can mislead: `code-review` in one plugin may only review a
  diff, in another audit a whole repo. The description decides.
- Another plugin may inject its own router with skills of the same names.
  Follow the user's instruction about which to use; without one, use Legion's
  and mention the overlap once.
