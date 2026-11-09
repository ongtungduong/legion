---
name: brainstorming
description: >-
  Draws out what the user wants and why, questions assumptions from first
  principles, compares two or three approaches with the Six Thinking Hats,
  grills open decisions, and gets a design doc approved before any code is
  written. Use before building or changing anything whose intent is not
  settled: a new feature, component, page, CLI, flow, or behavior change, even
  when phrased only as "add X", "help me shape Y", or "not sure of the details
  yet", or when the user already explained what and why and only wants
  options, approaches, or a recommendation; also when asked to "grill me",
  poke holes in or stress-test a plan, decision, or idea, think it through
  from first principles or with six thinking hats, or record an ADR under
  docs/adr/.
license: MIT
metadata:
  author: ongtungduong
---

# Brainstorming

Find out what the user wants and why, reduce the problem to what must be true,
compare real approaches from every angle, and write the result down as a
design doc the user approves. Your belief about what they want is usually
thinner than it feels; once you know the why, you make the hundred unstated
decisions the way they would.

## Workflow

1. **Pick the entry.** If the user only wants an existing plan, decision, or
   idea stress-tested ("grill me on this"), run the grilling procedure in
   [references/grilling.md](references/grilling.md) on it and stop at the
   confirmed playback; a design doc follows only if something is to be built.
   If the user only wants a decision already made recorded ("record an ADR
   for X"), read [references/adr-format.md](references/adr-format.md), write
   it, and stop. Otherwise continue with step 2.
2. **Decide whether this applies.** If everything that matters is in the
   request ("rename the flag to `--dry-run`"), skip this skill: do it and say
   what you did. A user who explained what and why but not how still gets
   steps 6 to 12: skip only the questions they already answered.
3. **Read before asking.** Read whatever the user pointed at, the code the
   change touches, and `GLOSSARY.md`/ADRs in that area, until you can explain
   how it works today. Never ask what the project already answers or reopen
   what the user already decided.
4. **Draw out intent, one question per message**, in the user's words. Until you
   know the why, ask open questions with no options attached. After that,
   propose concretely with your reason instead of asking. Ground to cover:
   intent and why now, who it is for, goals/non-goals/anti-goals, what exists
   and what was tried. With fuzzy terms, call the Skill tool with
   `legion:defining-terms`.
5. **Play back each part** in a short paragraph as soon as you understand it,
   marking what you filled in as your proposal, and ask what is wrong.
6. **Size the work** and say it; the size sets the depth of steps 7 to 9 (table
   below). Then find the smallest part of the scope that delivers most of the
   goal (Pareto) and propose the rest as non-goals or a later step; the user
   decides. Several independent projects: agree an order and brainstorm one
   at a time. If it grows mid-task, step up a size.
7. **First principles.** Reduce the problem to its goal, facts, and hard
   constraints; question every assumption the request or convention carries
   in; rebuild the simplest approach from what remains. For a project, read
   [references/first-principles.md](references/first-principles.md) and follow
   its procedure and output format.
8. **Lay out approaches in a message of their own:** two or three real
   alternatives grounded in the existing code, at least one of them the
   first-principles rebuild, then evaluate them with the Six Thinking Hats and
   recommend one. The Black hat inverts each approach (what would guarantee
   it fails) and, for a project, traces its second-order effects through the
   system. For a project, read
   [references/six-thinking-hats.md](references/six-thinking-hats.md) before
   the evaluation and use its sequence and table. If only one approach is
   sensible, say why the others fail.
9. **Grill the design.** Once the user picks an approach, read
   [references/grilling.md](references/grilling.md) and resolve the remaining
   design tree in rounds until the frontier is empty. Switch to it earlier, at
   any step, when three or more decisions are open at once or the user says
   "grill me".
10. **Write the design doc.** Copy [assets/design-doc-template.md](assets/design-doc-template.md)
   to `docs/legion/specs/YYYY-MM-DD-<topic>-design.md` (unless the repo or
   user prefers another place) and fill it, including the first-principles
   and hats results. Offer an ADR for the chosen approach or a grilled
   decision only when all three hold: hard to reverse, surprising without
   context, and the result of a real trade-off. Before writing one, read
   [references/adr-format.md](references/adr-format.md).
11. **Builder check (projects only).** Re-read the doc as a builder who must
    plan from it, or dispatch a fresh, read-only `general-purpose` subagent
    on `model: "sonnet"` to do it. Answer what the
    conversation already settled, settle minor gaps yourself and mark them as
    your calls, and bring only the real decisions to the user in one message.
12. **Get approval, then** call the Skill tool with `legion:writing-plans`.

| Size | Design doc | First principles | Six Thinking Hats | Grilling |
|---|---|---|---|---|
| Small change | Short: a line or two per section | One line: the assumption most worth questioning | Yellow and Black (inverted), one line per approach | Only if the user asks or 3+ decisions are open |
| Project | Full | Full procedure | Full sequence | Rounds until the frontier is empty |

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
  Propose it; keep the scope until they say yes.
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
