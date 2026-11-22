# Thinking lenses in depth

The procedure behind each lens in SKILL.md. Run only the lens in front of you,
at the depth the size of the work sets; the output blocks are working notes
for the design doc and the reply, not sections to paste whole.

## First principles

Strip the problem down to what cannot be argued with, then build up from there
instead of copying or tweaking the usual way.

1. **Goal in one sentence, in the user's terms, with no solution words.** "Let
   customers pay an invoice without calling us", not "build a payments page".
2. **List what must be true**, each marked *fact* (verified: cite code, data,
   docs, or "user said") or *hard constraint* (law, contract, budget,
   deadline, physics, an existing interface or data that must keep working).
3. **List the assumptions** carried in by convention or by the wording of the
   request ("needs a database", "must be real time", "has to be an app"). For
   each, ask what fact or constraint forces it: keep it and name what forces
   it, drop it, or ask the user when only they can say.
4. **Build the rebuilt option**: the simplest approach that satisfies every
   fact and constraint and nothing else. Compare it against the conventional
   one in step 7.

Output: the First principles section of the design doc.

- A rewrite needs a fact that forces it; reusing what exists is often the
  rebuilt answer.
- An assumption the user stated as a requirement still gets one question when
  nothing visible forces it.

## Inversion

Instead of "how do we reach the goal?", ask "how would we wreck it fastest?",
then turn each answer into prevention.

1. **Write the failure list.** For the goal and for each approach: the fastest
   ways to fail, including ones that "work" technically but hit an anti-goal
   (nobody uses it, it costs more than it saves, it breaks trust).
2. **Check which failures the current plan already walks into.** Those come
   first.
3. **Turn each failure into its prevention**: a design guard, a non-goal, an
   anti-goal, a check in Verification, or a risk with its mitigation under
   Constraints and risks.
4. **Name the flip condition** of every recommendation ("Wrong if"): a
   checkable fact, not a vague worry.

Output:

```
Fails if: <failure> -> Prevention: <guard / non-goal / check / mitigation>
```

- A failure with no prevention that sinks every approach is an anti-goal or a
  reason to stop, and the user hears it.
- Fears without a fact behind them are questions to settle, not verdicts.

## Six thinking hats

The method for choosing between approaches: one kind of thinking at a time,
across all candidates, so facts, ideas, optimism, and critique do not blur in
one pass. The evidence for the method is thin: treat it as a checklist against
a skipped perspective, not a ritual.

| Hat | Question | Notes |
|---|---|---|
| Blue (start) | What is being decided, and which one or two criteria decide most of it? | Criteria come from the agreed goals, anti-goals, and constraints; the rest only break ties. |
| White | What must be true, and what is only assumed? | Run First principles above. For a project, add the Systems map. A decisive unknown becomes a lookup or a question. |
| Green | Which approaches are worth comparing? | The conventional one, the one rebuilt from White's truths, and any combination. Ideas only, no critique yet. |
| Yellow | What share of the goal does each deliver, for what effort? | Benefits tied to the goals. Most of the goal for a fraction of the effort is a candidate even if incomplete. |
| Black | How does each fail, what does it set off, how reversible is it? | Run Inversion and Second-order on each approach, then migration, maintenance, cost if wrong. A failure that sinks every approach becomes an anti-goal. |
| Red | How does the user feel about it? | Reactions the user already expressed; if none, ask for a one-line gut reaction. Never invent them. |
| Blue (end) | Which approach, and what next? | The recommendation on the deciding criteria, citing the hat lines that settled it, with "Wrong if". |

Small change: White as one line (the assumption most worth questioning), then
Yellow and Black, one line each per approach. Project or hard-to-reverse
choice: the full sequence. Fill the table into the design doc's Approaches
section.

```markdown
Blue: deciding criteria are <...>.

| Hat | A: <conventional> | B: <rebuilt> |
|---|---|---|
| White: facts / unknowns specific to it | ... | ... |
| Green: better or combined option | ... | ... |
| Yellow: share of the goal, for what effort | ... | ... |
| Black: failures and preventions, second-order effects, cost if wrong | ... | ... |
| Red: your reaction so far | ... | ... |

Blue: recommend <A/B/new>, because <deciding hat lines>. Wrong if: <fact>. Next: <step>.
```

- Critique before ideas are out kills them. Finish Green before Black starts.
- Agents overweight Yellow when selling their pick and Black when hedging.
  Every approach gets a line under every hat.
- A Black risk that would change the decision needs a White fact behind it.
- Keep the table short: the hats exist to surface the deciding point, not to
  produce a report.

## Systems

See the solution inside everything around it, so fixing A does not break B.

1. **Map what the change touches**, upstream and downstream: people and roles,
   stakeholders who must agree or will be affected, processes and handoffs,
   tools and systems, data, money, schedules.
2. **Find the loops**: what feeds back into what (retries, caches, queues,
   load, incentives, workload shifting to another team). A loop that amplifies
   is a risk; one that dampens is often the cheapest fix.
3. **Find the constraint**: the one part whose limit sets the outcome of the
   whole. Work elsewhere does not move the result.
4. **Mark who must change** for the solution to hold, and whether they know.

Output: "What it touches" in the design doc's First principles section, and
the "Sets off elsewhere" row of the Approaches table.

- Stop the map where a part no longer changes a decision.

## Second-order

Ask "and then what?" until the chain stops changing the choice.

1. **For each option, write the first-order effect** (the intended result).
2. **Ask "and then what?"** for each: how do people, systems, and incentives
   react to the new state, now and after weeks or months? Two or three links
   are usually enough.
3. **Compare the chains, not the first links.** An option whose first effect
   is good but whose chain ends in a lasting cost (a workaround that becomes
   permanent, a metric that gets gamed, a dependency nobody owns) loses to one
   that fixes the cause.

Output:

```
<option>: <first effect> -> <then> -> <then>. Verdict: fixes cause / treats symptom
```

- A chain past the point where it changes the choice is speculation; stop.

## Impact vs. effort

Sort raw ideas or scope items on a 2x2 and do the quick wins first.

1. **List the candidates**: raw ideas, features, scope items, or open
   decisions.
2. **Score each** on impact (share of the goal it delivers, from the agreed
   goals) and effort (time, money, people, irreversibility), high or low, with
   the reason in a few words. Effort includes what is hard to undo.
3. **Place them:**

| | Low effort | High effort |
|---|---|---|
| **High impact** | Quick wins: do first | Big bets: plan, maybe split |
| **Low impact** | Fill-ins: only if nearly free | Money pits: drop |

4. **Propose the cut**: quick wins as the first slice, big bets as later
   steps or non-goals, money pits dropped. The user decides.

- Scores are estimates; a placement that decides the cut needs its reason
  stated so the user can move it.
- A big bet that the goal cannot do without stays in scope, split into a
  first quick-win slice where possible.
