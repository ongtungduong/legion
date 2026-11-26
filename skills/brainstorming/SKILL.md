---
name: brainstorming
description: >-
  Draws out what the user wants and why on any open-ended topic, generates a
  wide field of options before narrowing to the two or three worth comparing,
  grills open decisions in rounds, and gets a design doc or decision record
  approved before anything is built. Use whenever the direction of a piece of work is not settled,
  in any domain: something new to build or change (a product, a
  feature, a flow), a strategy, a system, a process, a decision, even when phrased only as "help me think
  this through", "help me shape Y", "brainstorm options for", or "not sure of
  the details yet", or when the user already explained what and why and only
  wants options, approaches, or a recommendation ("what are my options",
  "which would you pick"); also when asked to "grill me", poke holes in or stress-test a
  plan, decision, or idea, or think it through from first principles, by
  inversion, with six thinking hats, systems or second-order thinking, or an
  impact/effort matrix.
license: MIT
metadata:
  author: ongtungduong
---

# Brainstorming

Find out what the user wants and why, then run two methods: a **comparison of
approaches**, generated wide and then narrowed, to choose one, and
**grilling** to settle every decision the chosen approach leaves open. The
result is a design doc the user approves, or a decision record when nothing
is to be built.
Your belief about what they want is
usually thinner than it feels; once you know the why, you make the hundred
unstated decisions the way they would.

## Thinking lenses

Six lenses shape what you ask and recommend. They are not passes, rituals, or
headings in your reply: use each where it changes a question, a
recommendation, or the scope, and drop it where it does not. Their value is
that none gets skipped. When the user names a lens or a project needs one at
depth, read [references/lenses.md](references/lenses.md) for its procedure.

| Lens | What it forces | Steps |
|---|---|---|
| First principles | Goal with no solution words; what must be true; every unforced "given" gets "what forces this?"; one approach built from those truths | 3-4, 7 |
| Inversion | "How would we wreck this fastest?"; each failure becomes a prevention; every recommendation carries "Wrong if", the checkable fact that would flip it | 7-9 |
| Six hats | Facts, feelings, risks, benefits, new options, and synthesis one at a time (White, Red, Black, Yellow, Green, Blue) | 7 |
| Systems | The people, stakeholders, processes, tools, data, and feedback loops the work touches, so fixing A does not break B | 3, 7-8 |
| Second-order | "And then what?" until the chain stops changing the choice; a symptom fix with a lasting cost loses | 7-8 |
| Impact vs. effort | Quick wins first, big bets planned, fill-ins deferred, money pits dropped; the same cut orders the grilling | 6, 8 |

## Workflow

1. **Pick the entry.** If the user only wants an existing plan, decision, or
   idea stress-tested ("grill me on this"), run the grilling procedure in
   [references/grilling.md](references/grilling.md) on it and stop at the
   confirmed playback; a design doc follows only if something is to be built
   or produced. Otherwise continue with step 2.
2. **Decide whether this applies.** If everything that matters is in the
   request ("rename the flag to `--dry-run`"), skip this skill: do it and say
   what you did. A user who explained what and why but not how still gets
   steps 6 to 11: skip only the questions they already answered.
3. **Read before asking.** Read whatever already exists for the topic: what
   the user pointed at, documents, data, prior decisions, the current process
   or system, code if there is any, and any glossary or decision records in that area,
   until you can explain how things work today. What you read is fact for the
   comparison. Never ask what the material already answers or reopen what the
   user already decided.
4. **Draw out intent, one question per message**, in the user's words. Ask
   only what you cannot infer: when the request or the material already
   shows the why, play it back as your reading (step 5) instead of asking.
   Until you know the why, ask open questions with no options attached. After that,
   propose concretely with your reason instead of asking. Ground to cover:
   intent and why now, who it is for, goals/non-goals/anti-goals, what exists
   and what was tried. Once the why is known, settle the remaining
   requirement gaps (constraints, edge cases, what "done" means) as grilling
   rounds per [references/grilling.md](references/grilling.md) rather than
   one by one.
5. **Play back each part** in a short paragraph as soon as you understand it,
   marking what you filled in as your proposal, and ask what is wrong.
6. **Size the work and cut the scope.** Say the size; it sets the
   depth of steps 7 and 8 (table below). Then cut the scope by impact vs.
   effort: propose the first slice, and the rest as non-goals or later steps;
   the user decides. Several independent projects: agree an
   order and brainstorm one at a time. If it grows mid-task, step up a size.
7. **Choose the approach**, in a message of its own. Diverge before you
   judge: in your working notes, list at least five candidates before
   rejecting any, covering doing nothing, reusing or buying what exists, the
   conventional approach, the one rebuilt from first principles, and one
   that reframes the problem (solve it earlier, later, elsewhere, or for
   someone else). The first idea that comes to mind anchors every later
   one; a wide list is the cheapest guard. Then narrow to two or three
   real alternatives grounded in what exists, name in one line what else
   was considered and the fact that ruled it out, and give each its
   benefit for the goal, cost, most likely failure, and what it sets off
   elsewhere, recommend one, and say what fact would flip the recommendation.
   If only one approach is sensible, say why the others fail. When the user
   asks for the Six Thinking Hats, or a project's choice is hard to reverse,
   run the Six thinking hats procedure in
   [references/lenses.md](references/lenses.md) instead.
8. **Grill the design.** Once the user picks an approach, read
   [references/grilling.md](references/grilling.md) and resolve the remaining
   design tree in rounds until the frontier is empty. Switch to it earlier, at
   any step, when three or more decisions are open at once.
9. **Write the design doc.** Copy [assets/design-doc-template.md](assets/design-doc-template.md)
   to `.legion/specs/YYYY-MM-DD-<topic>-design.md` (unless the user or the
   project prefers another place) and fill it, including the approach
   comparison and the grilled decisions. When the result is a decision
   rather than something to build or produce (a choice between options, a
   strategy call, a yes or no), write a **decision record** in the reply
   instead: the decision, the options weighed, the deciding points, "Wrong
   if", every default you chose, and the next step. Save it as a file only
   if the user wants it on record.
10. **Builder check (projects only).** Re-read the doc as the person who must
    plan and carry out the work from it, or dispatch a fresh, read-only
    `general-purpose` subagent on tier `standard` to do it. Answer what the
    conversation already settled, settle minor gaps yourself and mark them as
    your calls, and bring only the real decisions to the user in one message.
11. **Get approval, then** offer the next step. When the work has several
    steps, offer to call the Skill tool with `legion:planning`, which breaks
    it into small tasks in dependency order. When it is a single action, do
    it or hand it back as the user prefers.

| Size | Design doc | Approaches | Grilling |
|---|---|---|---|
| Decision only | None: a decision record in the reply | The wide list in notes; full trade-offs for the two or three kept | Until the deciding points are settled |
| Small change | Short: a line or two per section | The wide list in notes; one line of trade-offs per approach kept | Only if the user asks or 3+ decisions are open |
| Project | Full | The wide list in notes; full trade-offs for each approach kept | Rounds until the frontier is empty |

## The approval gate

Nothing gets built or produced until the user approves the design doc, short
or full, or confirms the decision record. That includes code, deliverables, rollouts, and documents that build
on the direction; reading and exploring are fine. The reason: work built on a
misread intent is the most expensive mistake to undo, and once something
exists the conversation anchors on it.

Two exits: the user opts out ("just do it"), in which case state any
significant how-it-gets-made choice in one line and proceed; or a throwaway
draft or spike the user agreed to.

## Gotchas

- "Sounds good" to an idea is not approval of a doc the user has not seen.
- Briefs handed over by users are usually incomplete; confirm before building
  on one.
- Offering a menu before you know the why steers the user toward your guesses.
- A default you chose silently is one the user could not reject. Say each one.
- Question what the request assumes, not what is already true: existing
  systems, data, commitments, and contracts are facts, and reusing them is
  often the best answer.
- A scope cut the user did not agree to is a silently dropped requirement.
  Propose it; keep the scope until they say yes. The same holds for a grilling
  decision you defaulted: it goes in the playback.
- A draft or spike that works is still throwaway. Keeping it is a new request
  that comes back through this skill.
- Neighbouring items the user mentions as context (the other commands, pages,
  or teams that have the same gap) are not scope. Recommend for the thing
  asked, name the rest in one line as a follow-up, and widen only if the user
  says so: a wider change is one they did not ask to review.
- A small change gets a short reply: the recommendation, one line per
  alternative kept, the flip condition. Skip code, a system map, and
  options the stated facts already rule out.
- Process choices (where files go, what to read, how to show something) are
  yours. Decide and say so; do not ask.
