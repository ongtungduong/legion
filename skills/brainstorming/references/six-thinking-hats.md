# Six Thinking Hats evaluation

Edward de Bono's method (1985): look at a decision through one kind of thinking
at a time instead of mixing facts, critique, optimism, and ideas in one pass.
Here it is the way to compare the two or three approaches before recommending
one. Evidence that it improves thinking in general is sparse, so treat it as a
checklist that keeps any one kind of thinking from being skipped, not as a
ritual.

## Sequence for choosing between approaches

Run the hats in this order, one hat at a time, across all candidates:

| Hat | Question for each approach | Notes |
|---|---|---|
| Blue (start) | What is being decided, and by what criteria? | Take the criteria from the goals, anti-goals, and constraints already agreed. |
| White | What facts do we have, what is unknown, and how would we find out? What does it touch? | Facts only, with sources. A decisive unknown becomes a lookup or a question. For a project, map the system: the users, services, data, and jobs upstream and downstream of the change. |
| Green | Is there a better option, or a combination of these? | May add or merge an approach. Ideas only, no critique yet. |
| Yellow | What value does it deliver, and why might it be the best choice? | Benefits tied to the goals, not generic praise. |
| Black | What would guarantee it fails? What does it set off elsewhere? What does it cost, and how reversible is it? | Invert first: list what would make the approach fail, then check which of those it does. For a project, trace second-order effects through the White-hat map: feedback loops (retries, caches, queues, load), incentives, what other teams must change. Then migration, maintenance, cost if wrong. A failure that would sink every approach becomes an anti-goal. |
| Red | How does the user feel about it? | Report reactions the user has already expressed. If none, ask for a gut reaction in one line. Never invent the user's feelings. |
| Blue (end) | Which approach, and what is the next step? | The recommendation, with the hats that decided it. |

## Depth by size

- **Small change:** Yellow and Black only, one line each per approach; the
  Black line is the most likely way it fails.
- **Project or hard-to-reverse choice:** the full sequence.

## Output format

```markdown
| Hat | A: <name> | B: <name> |
|---|---|---|
| White: facts / unknowns | ... | ... |
| Green: better or combined option | ... | ... |
| Yellow: value | ... | ... |
| Black: inverted failures, second-order effects, cost if wrong | ... | ... |
| Red: your reaction so far | ... | ... |

Blue: criteria were <...>. Recommend <A/B/new>, because <the hat lines that decided it>. Next: <step>.
```

## Gotchas

- Mixing hats lets critique kill ideas before they form. Finish Green before
  Black starts.
- Agents tend to overweight one hat: Yellow when selling their own
  recommendation, Black when hedging. Give every approach a line under every
  hat in the sequence.
- Second-order effects stop where they no longer change the choice. A chain
  of "and then" past that point is speculation, not systems thinking.
- A Black-hat risk that would change the decision needs a fact behind it
  (White). An unsupported fear is a question to settle, not a verdict.
- Keep the table short. The hats exist to surface the deciding point, not to
  produce a report.
