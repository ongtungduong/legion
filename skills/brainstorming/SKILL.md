---
name: brainstorming
description: >-
  Draws out what the user wants and why, compares two or three approaches with
  the Six Thinking Hats, grills open decisions in rounds, and gets a design
  doc approved before any code is written, thinking throughout with first
  principles, inversion, systems thinking, and Pareto. Use before building or
  changing anything whose intent is not settled: a new feature, component,
  page, CLI, flow, or behavior change, even when phrased only as "add X",
  "help me shape Y", or "not sure of the details yet", or when the user
  already explained what and why and only wants options, approaches, or a
  recommendation; also when asked to "grill me", poke holes in or stress-test
  a plan, decision, or idea, think it through from first principles or with
  six thinking hats, or record an ADR under docs/adr/; and when terminology is
  fuzzy or contested (one word for two concepts, two words for one) or a
  definition belongs in GLOSSARY.md.
license: MIT
metadata:
  author: ongtungduong
---

# Brainstorming

Find out what the user wants and why, then run two methods: the **Six Thinking
Hats** to choose an approach, and **grilling** to settle every decision the
chosen approach leaves open. Both run on the same four thinking models, and
the result is a design doc the user approves. Your belief about what they want
is usually thinner than it feels; once you know the why, you make the hundred
unstated decisions the way they would.

## Thinking system

Four models, each placed where it changes a decision. Apply them inside the
methods, not as extra passes.

| Model | Core question | In the Six Thinking Hats | In grilling |
|---|---|---|---|
| First principles | What must be true, and what forces each assumption? | White: goal, facts, hard constraints, assumptions questioned. Green: the approach rebuilt from those truths. | Every question traces to a goal or constraint; a "given" nothing forces gets "what forces this?" |
| Inversion | What would guarantee failure? | Black: list what would make each approach fail, then check which it does. | Every recommendation carries "Wrong if": the fact that would flip it. |
| Systems thinking | What does it touch, and what does it set off? | White: map of what sits upstream and downstream. Black: second-order effects and feedback loops. | The design tree is the dependency map; each answer adds the branches it sets off elsewhere. |
| Pareto | Which few parts decide most of the outcome? | Blue: the one or two criteria that decide. Yellow: share of the goal each approach delivers for its cost. | Ask the highest-leverage decisions first; default the ones that would not change what gets built. |

Pareto also sets the scope (step 6). Each model stops where it no longer
changes what gets built; past that point it is philosophy, not design.

## Workflow

1. **Pick the entry.** If the user only wants an existing plan, decision, or
   idea stress-tested ("grill me on this"), run the grilling procedure in
   [references/grilling.md](references/grilling.md) on it and stop at the
   confirmed playback; a design doc follows only if something is to be built.
   If the user only wants a decision already made recorded ("record an ADR
   for X"), read [references/adr-format.md](references/adr-format.md), write
   it, and stop. If the user only wants terms pinned down ("account or
   customer?", "add X to GLOSSARY.md"), read
   [references/glossary-format.md](references/glossary-format.md), settle and
   record them, and stop. Otherwise continue with step 2.
2. **Decide whether this applies.** If everything that matters is in the
   request ("rename the flag to `--dry-run`"), skip this skill: do it and say
   what you did. A user who explained what and why but not how still gets
   steps 6 to 11: skip only the questions they already answered.
3. **Read before asking.** Read whatever the user pointed at, the code the
   change touches, and `GLOSSARY.md`/ADRs in that area, until you can explain
   how it works today. What you read is fact for the White hat. Never ask what
   the project already answers or reopen what the user already decided.
4. **Draw out intent, one question per message**, in the user's words. Until you
   know the why, ask open questions with no options attached. After that,
   propose concretely with your reason instead of asking. Ground to cover:
   intent and why now, who it is for, goals/non-goals/anti-goals, what exists
   and what was tried.
5. **Play back each part** in a short paragraph as soon as you understand it,
   marking what you filled in as your proposal, and ask what is wrong.
6. **Size the work and cut the scope (Pareto).** Say the size; it sets the
   depth of steps 7 and 8 (table below). Then find the smallest part of the
   scope that delivers most of the goal and propose the rest as non-goals or
   a later step; the user decides. Several independent projects: agree an
   order and brainstorm one at a time. If it grows mid-task, step up a size.
7. **Choose the approach with the Six Thinking Hats**, in a message of its
   own. Blue sets the criteria; White reduces the problem to its goal, facts,
   and hard constraints and questions every assumption; Green lays out two or
   three real alternatives grounded in the existing code, at least one of them
   rebuilt from White's truths; Yellow, Black (inverted), and Red evaluate
   them; Blue recommends one. For a project, read
   [references/six-thinking-hats.md](references/six-thinking-hats.md) first
   and use its procedure and table. If only one approach is sensible, say why
   the others fail.
8. **Grill the design.** Once the user picks an approach, read
   [references/grilling.md](references/grilling.md) and resolve the remaining
   design tree in rounds until the frontier is empty. Switch to it earlier, at
   any step, when three or more decisions are open at once or the user says
   "grill me".
9. **Write the design doc.** Copy [assets/design-doc-template.md](assets/design-doc-template.md)
   to `.legion/specs/YYYY-MM-DD-<topic>-design.md` (unless the repo or
   user prefers another place) and fill it, including the hats table and the
   grilled decisions. Offer an ADR for the chosen approach or a grilled
   decision only when all three hold: hard to reverse, surprising without
   context, and the result of a real trade-off. Before writing one, read
   [references/adr-format.md](references/adr-format.md).
10. **Builder check (projects only).** Re-read the doc as a builder who must
    plan from it, or dispatch a fresh, read-only `general-purpose` subagent
    on `model: "sonnet"` to do it. Answer what the
    conversation already settled, settle minor gaps yourself and mark them as
    your calls, and bring only the real decisions to the user in one message.
11. **Get approval, then** call the Skill tool with `legion:writing-plans`.

| Size | Design doc | Six Thinking Hats | Grilling |
|---|---|---|---|
| Small change | Short: a line or two per section | White: one line, the assumption most worth questioning. Yellow and Black (inverted): one line per approach. | Only if the user asks or 3+ decisions are open; "Wrong if" on each recommendation |
| Project | Full | Full sequence, with system map and second-order effects | Rounds until the frontier is empty |

## The approval gate

Nothing gets built until the user approves the design doc, short or full.
Building includes product code, scaffolding, installing dependencies, and
starting an implementation skill; reading and exploring are fine. The reason:
code built on a misread intent is the most expensive mistake to undo, and once
code exists the conversation anchors on it.

Two exits: the user opts out ("just build it"), in which case state any
significant how-it-gets-made choice in one line and proceed; or a throwaway
spike the user agreed to.

## Gotchas

- "Sounds good" to an idea is not approval of a doc the user has not seen.
- Specs handed over by users are usually incomplete; confirm before building
  on one.
- Offering a menu before you know the why steers the user toward your guesses.
- A default you chose silently is one the user could not reject. Say each one.
- First principles questions what the request assumes, not what the system
  already guarantees: existing code, data, and contracts are facts, and reusing
  them is often the first-principles answer.
- A Pareto cut the user did not agree to is a silently dropped requirement.
  Propose it; keep the scope until they say yes. The same holds for a grilling
  decision you defaulted: it goes in the playback.
- The Red hat is the user's reaction, never yours: quote what they said or ask
  for a one-line gut reaction.
- Grilling questions are decisions for the user; facts you can look up are
  yours to find before the round.
- Most decisions do not need an ADR. One that fails any of the three tests is
  noise that buries the ones that matter.
- A spike that works is still throwaway. Keeping it is a new request that comes
  back through this skill.
- Process choices (where files go, what to read, how to show something) are
  yours. Decide and say so; do not ask.
