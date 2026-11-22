# Grilling

Interview the user until every open decision is resolved, for requirements or
design alike. Model the topic as a **design tree**: every decision branches
into the decisions that depend on it. Each question is a selection with your
recommendation first, so the user settles it with one pick instead of typing
an answer.

## Procedure

1. **Collect facts yourself first.** Never ask what you can look up; dispatch
   a fresh, read-only `general-purpose` subagent on tier `cheap` for slow
   lookups and keep asking the questions that do not depend on them.
2. **Build the tree.** A decision belongs in it only if a goal or hard
   constraint makes it matter; an unforced "given" becomes the decision "what
   forces this?". For each node, add as children the decisions and effects it
   sets off elsewhere (systems and second-order lenses).
3. **Compute the frontier:** every open decision whose prerequisites are
   settled. Order it by leverage: first what closes the most branches or is
   hardest to reverse. A decision whose answer would not change the outcome
   gets your default instead of a question.
4. **Turn each frontier decision into 2-4 options**, each a real choice with
   what it trades off. A decision you cannot name options for is not ready:
   look up what is missing, or split it.
5. **Ask the round as one selection call**, in the format below. In Claude
   Code that is `AskUserQuestion`, which takes up to 4 questions per call and
   adds an "Other" choice for a free-text answer; ask the highest-leverage
   ones and carry the rest, or fewer if the user's rules cap questions per
   message. Before the call, state in one line any
   decisions you defaulted, so the user can reject them.
6. **Read the picks**, then recompute the frontier. An "Other" answer is a new
   fact: re-check the decisions it touches. A question that depends on one
   still open belongs to a later round.
7. **Use the project's vocabulary.** Phrase questions in the terms of its
   glossary, if one exists. When a term the design depends on is fuzzy or
   contested (one word for two concepts, two words for one), settle it in the
   round: recommend one term, with a concrete scenario that forces the
   boundary.
8. **Invert the settled tree, then finish.** When the frontier is empty, ask
   how the settled design would fail fastest; a failure no answer prevents
   becomes one more round. Then play the tree back in a short summary, listing
   every default and assumption so it can be rejected, and do not act on it
   until the user confirms it (a selection: confirm, or change something).

## Output format

One question per open decision in the selection call:

- **question**: self-contained, since the dialog may hide earlier text: the
  decision, the context it needs, and what it sets off downstream.
- **header**: a 1-3 word label of 12 characters or fewer.
- **options**: your recommendation first, its label ending in
  "(Recommended)"; its description gives the reason and "Wrong if: <the fact
  that would flip it>". Every other option's description says what it trades
  off. A yes/no decision is two options. Do not add your own "Other".
- **multiSelect**: only when the options are not mutually exclusive.

Without a selection tool (another harness, a non-interactive run, or the call
fails), write the round as text the user can answer in a few characters
("1A, 2B"):

```
**Q1 - <title>**: <question>
A. <recommended option> (Recommended): <reason>. Wrong if: <fact>
B. <option>: <trade-off>
Sets off: <downstream decisions or effects, if any>

Defaulted (no effect on the outcome): <decision> -> <default>
```

## Gotchas

- Questions that depend on each other in the same round force the user to
  guess; keep dependent questions for the next round.
- Options that are not real (a straw man next to the recommendation) turn
  the pick into a rubber stamp. Each option is one you would defend in some
  situation.
- A recommendation the user has not accepted is still open, however obvious
  it seems.
- "Wrong if" names a checkable fact, not a vague risk. If you cannot name one,
  the recommendation is a guess: say so or look the fact up first.
