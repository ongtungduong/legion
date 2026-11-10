# Grilling

Interview the user until every open decision is resolved. Model the topic as a
**design tree**: every decision branches into the decisions that depend on it.
Recommend an answer for every question so the user can accept it in a word.
Grilling runs on the same four thinking models as the hats: first principles
decides which questions exist, systems thinking shapes the tree, Pareto orders
it, and inversion tests every recommendation.

## Procedure

1. **Collect facts yourself first.** Read the code, files, and docs the topic
   touches. Never ask the user for something you can look up; dispatch a
   fresh, read-only `general-purpose` subagent on `model: "haiku"` for slow
   lookups and keep asking the questions that
   do not depend on them.
2. **Build the tree from first principles.** A decision belongs in the tree
   only if a goal or hard constraint makes it matter. When the plan or the
   user treats something as given and no fact or constraint forces it, add
   the decision "what forces this?" instead of building on it.
3. **Map what each decision sets off (systems thinking).** For every node,
   note the decisions it creates elsewhere: other components, data, jobs,
   teams, and feedback loops such as retries, caches, and queues. Those
   become child branches.
4. **Compute the frontier:** every open decision whose prerequisites are
   already settled.
5. **Order the frontier by leverage (Pareto).** Ask first the decisions that
   close the most branches or are hardest to reverse. A decision whose answer
   would not change what gets built gets your default instead of a question,
   and goes in the playback.
6. **Ask the frontier as one round**, numbered, each with your recommendation
   worded so "yes" accepts it, and the fact or condition that would make it
   wrong (inversion). If the user's rules cap questions per message, ask the
   highest-leverage ones and carry the rest.
7. **Wait for the answers**, then recompute the frontier. A question that
   depends on one still open belongs to a later round.
8. **Use the project's vocabulary.** If `GLOSSARY.md` exists, phrase questions
   in its terms.
9. **Invert the settled tree, then finish.** When the frontier is empty, ask
   what would make the settled design fail; a failure no answer covers becomes
   one more round. Then play the tree back in a short summary, listing every
   default and assumption you made so it can be rejected, and do not act on
   it until the user confirms it.

## Output format

```
**Q1 - <title>**: <question; when the choice can be named, the options and what each trades off>
Recommended: <answer> - <one-line reason>
Wrong if: <the fact or condition that would flip it>
Sets off: <downstream decisions or effects, if any>

**Q2 - <title>**: ...
Recommended: ...
Wrong if: ...

Defaulted (no effect on what gets built): <decision> -> <default>
```

## Gotchas

- Questions that depend on each other in the same round force the user to
  guess; keep dependent questions for the next round.
- A recommendation the user has not accepted is still open, however obvious
  it seems.
- A branch assumed silently is the failure grilling exists to prevent; put
  every assumption and default in the playback.
- "Wrong if" names a checkable fact, not a vague risk. If you cannot name one,
  the recommendation is a guess: say so or look the fact up first.
- Downstream branches stop where they no longer change what gets built.
