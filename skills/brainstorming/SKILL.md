---
name: brainstorming
description: >-
  Draws out what the user wants and why, compares two or three approaches
  grounded in the code, grills open decisions in rounds, and gets a design
  doc approved before any code is written, thinking throughout with first
  principles, inversion, systems thinking, and Pareto. Use before building or
  changing anything whose intent is not settled: a new feature, component,
  page, CLI, flow, or behavior change, even when phrased only as "add X",
  "help me shape Y", or "not sure of the details yet", or when the user
  already explained what and why and only wants options, approaches, or a
  recommendation ("what are my options", "which would you pick"), even when
  an existing helper looks like the obvious fit; also when asked to "grill me", poke holes in or stress-test
  a plan, decision, or idea, think it through from first principles or with
  six thinking hats, or record an ADR under docs/adr/; and when terminology is
  fuzzy or contested (one word for two concepts, two words for one) or a
  definition belongs in GLOSSARY.md.
license: MIT
metadata:
  author: ongtungduong
---

# Brainstorming

Find out what the user wants and why, then run two methods: a **comparison of
approaches** to choose one, and **grilling** to settle every decision the
chosen approach leaves open. Both run on the same four thinking models, and
the result is a design doc the user approves. Your belief about what they want
is usually thinner than it feels; once you know the why, you make the hundred
unstated decisions the way they would.

## Thinking rules

Four rules change what you ask and recommend; apply them inside the methods,
not as extra passes. Each stops where it no longer changes what gets built.

- Every question traces to a goal or constraint; a "given" nothing forces gets
  "what forces this?" (first principles).
- Every recommendation carries "Wrong if": the fact that would flip it
  (inversion).
- Each answer adds the branches it sets off elsewhere (systems thinking).
- Ask the highest-leverage decisions first, default the ones that would not
  change what gets built, and let the same cut set the scope in step 6
  (Pareto).

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
   how it works today. What you read is fact for the comparison. Never ask what
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
7. **Choose the approach**, in a message of its own. Lay out two or three
   real alternatives grounded in the existing code, give the trade-offs of
   each, recommend one, and say what fact would flip the recommendation. If
   only one approach is sensible, say why the others fail. When the user asks
   for the Six Thinking Hats, read
   [references/six-thinking-hats.md](references/six-thinking-hats.md) and
   run its procedure instead; fill its table into the design doc's
   Approaches section.
8. **Grill the design.** Once the user picks an approach, read
   [references/grilling.md](references/grilling.md) and resolve the remaining
   design tree in rounds until the frontier is empty. Switch to it earlier, at
   any step, when three or more decisions are open at once or the user says
   "grill me".
9. **Write the design doc.** Copy [assets/design-doc-template.md](assets/design-doc-template.md)
   to `.legion/specs/YYYY-MM-DD-<topic>-design.md` (unless the repo or
   user prefers another place) and fill it, including the approach comparison
   and the grilled decisions. Offer an ADR for the chosen approach or a grilled
   decision only when all three hold: hard to reverse, surprising without
   context, and the result of a real trade-off. Before writing one, read
   [references/adr-format.md](references/adr-format.md).
10. **Builder check (projects only).** Re-read the doc as a builder who must
    plan from it, or dispatch a fresh, read-only `general-purpose` subagent
    on `model: "sonnet"` to do it. Answer what the
    conversation already settled, settle minor gaps yourself and mark them as
    your calls, and bring only the real decisions to the user in one message.
11. **Get approval, then** call the Skill tool with `legion:writing-plans`.

| Size | Design doc | Approaches | Grilling |
|---|---|---|---|
| Small change | Short: a line or two per section | One line of trade-offs per approach | Only if the user asks or 3+ decisions are open; "Wrong if" on each recommendation |
| Project | Full | Full trade-offs for each approach | Rounds until the frontier is empty |

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
- Grilling questions are decisions for the user; facts you can look up are
  yours to find before the round.
- Most decisions do not need an ADR. One that fails any of the three tests is
  noise that buries the ones that matter.
- A spike that works is still throwaway. Keeping it is a new request that comes
  back through this skill.
- Process choices (where files go, what to read, how to show something) are
  yours. Decide and say so; do not ask.
