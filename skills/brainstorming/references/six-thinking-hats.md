# Six Thinking Hats: choosing the approach

Edward de Bono's method (1985): look at a decision through one kind of thinking
at a time instead of mixing facts, critique, optimism, and ideas in one pass.
Here it is the method for choosing between approaches. Evidence that the method improves thinking in general is
sparse, so treat it as a checklist that keeps any one kind of thinking from
being skipped, not as a ritual.

## Sequence

Run the hats in this order, one hat at a time, across all candidates:

| Hat | Question | Notes |
|---|---|---|
| Blue (start) | What is being decided, and which one or two criteria decide most of it? | Take the criteria from the goals, anti-goals, and constraints already agreed. Name the deciding ones; the rest only break ties. |
| White | What must be true, what is assumed, and what does the change touch? | Run the White-hat procedure below. Facts only, with sources. A decisive unknown becomes a lookup or a question. |
| Green | Which approaches are worth comparing? | Two or three real alternatives grounded in the existing code: the conventional one and the one rebuilt from White's truths, plus any combination. Ideas only, no critique yet. |
| Yellow | What share of the goal does each approach deliver, for what cost? | Benefits tied to the goals, not generic praise. An approach that delivers most of the goal for a fraction of the cost is a candidate even if it is not complete. |
| Black | What would guarantee it fails? What does it set off elsewhere? What does it cost, and how reversible is it? | Invert first: list what would make the approach fail, then check which of those it does. For a project, trace second-order effects through the White-hat map: feedback loops (retries, caches, queues, load), incentives, what other teams must change. Then migration, maintenance, cost if wrong. A failure that would sink every approach becomes an anti-goal. |
| Red | How does the user feel about it? | Report reactions the user has already expressed. If none, ask for a gut reaction in one line. Never invent the user's feelings. |
| Blue (end) | Which approach, and what is the next step? | The recommendation, decided by the deciding criteria from Blue (start), with the hat lines that settled it. |

## White-hat procedure (facts and system map)

Its job is to stop the approaches from being copies of the obvious solution
when the obvious solution rests on an assumption nobody checked.

1. **State the irreducible goal** in one sentence, in the user's terms, with no
   solution words in it. "Let customers pay an invoice without calling us",
   not "build a payments page".
2. **List what must be true**, and mark each as one of:
   - *fact*: verified in code, data, docs, or by the user (cite where);
   - *hard constraint*: law, contract, budget, deadline, platform, physics, an
     existing public API or data that must keep working.
3. **List the assumptions** carried in by convention or by the wording of the
   request: "needs a database", "must be real time", "has to be a web app",
   "we need a new service", "users will log in". For each, ask what fact or
   constraint forces it.
   - Forced by a fact or constraint: keep it, and name what forces it.
   - Forced by nothing: drop it, or turn it into an open question for the user
     if only they can say.
4. **Map the system (project only):** the users, services, data, and jobs
   upstream and downstream of the change. Black traces effects through this
   map.
5. **Hand the truths to Green:** the rebuilt approach is the simplest one that
   satisfies every fact and constraint and nothing else. Existing code, data,
   and contracts are facts, not assumptions; reusing what is there is often
   the right answer, and a rewrite needs a fact that forces it.

## Depth by size

- **Small change:** White as one line (the assumption most worth questioning),
  then Yellow and Black only, one line each per approach; the Black line is
  the most likely way it fails.
- **Project or hard-to-reverse choice:** the full sequence and procedure.

## Output format

```markdown
Blue: deciding criteria are <...>.

White:
Goal: <one sentence, no solution words>
Must be true:
- <fact> (source: <file, doc, or "user said">)
- <hard constraint> (why it binds)
Assumptions questioned:
- "<assumption>" -> keep: forced by <fact/constraint>
- "<assumption>" -> drop: convention only
- "<assumption>" -> ask: only the user can say
System touched: <upstream and downstream, project only>

| Hat | A: <conventional> | B: <rebuilt> |
|---|---|---|
| White: facts / unknowns specific to it | ... | ... |
| Green: better or combined option | ... | ... |
| Yellow: share of the goal, for what cost | ... | ... |
| Black: inverted failures, second-order effects, cost if wrong | ... | ... |
| Red: your reaction so far | ... | ... |

Blue: recommend <A/B/new>, because <the hat lines that decided it on the deciding criteria>. Next: <step>.
```

## Gotchas

- Mixing hats lets critique kill ideas before they form. Finish Green before
  Black starts.
- Agents tend to overweight one hat: Yellow when selling their own
  recommendation, Black when hedging. Give every approach a line under every
  hat in the sequence.
- Questioning assumptions is not "rebuild everything from scratch". It targets
  what the request assumes, not what the system already guarantees.
- An assumption the user stated as a requirement is still worth one question
  when nothing visible forces it: "Does it have to be real time, or is a
  five-minute delay fine?"
- Second-order effects stop where they no longer change the choice. A chain
  of "and then" past that point is speculation.
- A Black-hat risk that would change the decision needs a fact behind it
  (White). An unsupported fear is a question to settle, not a verdict.
- Keep the table short. The hats exist to surface the deciding point, not to
  produce a report.
