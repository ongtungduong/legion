# Five whys

Ask "why?" from the observed symptom down to a cause the team controls. Each
answer is a hypothesis, proved with the lenses before the next why is asked;
the chain is only as strong as its weakest unproved link. Model it as a **why
tree**: a link can have more than one contributing cause, and each branch is
followed.

## Procedure

1. **Start from the symptom as observed**: the loop's output, in exact terms,
   not a paraphrase or someone's diagnosis (facts vs. assumptions).
2. **Ask "why did this happen?"** of the current link and list the candidate
   answers, common ones first (common before rare). Look at what changed
   just before it started (delta) and check the basic conditions before the
   complex ones (bottom-up).
3. **Prove one answer before going deeper.** Run the fastest check that would
   prove it wrong (falsification); locate it by halving the chain or the
   time since it last worked (bisection), by taking parts away (isolation),
   one change per try (one variable at a time). When nothing fits, question
   what everyone treats as fine (nothing is obviously fine). An answer
   without evidence stays a hypothesis; never build the next why on it.
4. **Branch when two answers both hold**, because both were needed or both
   contribute. Follow each branch; a single chain for a failure with two
   causes leaves one of them in place.
5. **At the confirmed cause, change the question.** Up to here the chain asks
   "why did it happen?" (the mechanism; workflow steps 4-5). From the cause
   it asks "why was this possible?": why nothing caught it earlier, which
   check, guard, test, review, alert, or procedure step was missing or did
   not work (workflow step 6).
6. **Stop** at a cause the team controls, where a recurrence control can go.
   Five is a guide, not a quota: stop sooner when you reach it, go further
   when you have not. Stop before the next why leaves what the team controls
   ("people make mistakes", "the vendor had an outage" are facts, not
   causes to fix).
7. **Hand each end of the tree to the fix**: the confirmed cause gets the
   fix, and each controllable "why was this possible?" end gets a recurrence
   control or a proposal for the user (workflow step 7).

## Output format

```
Symptom: <exactly what was observed> (evidence: <loop output>)
Why 1: <answer> - evidence: <probe and result>
Why 2: <answer> - evidence: <probe and result>
  Branch 2b: <second contributing cause> - evidence: <...>
Cause (fix here): <link>
Why possible 1: <missing or failed defense> - evidence: <...>
Why possible n (team controls): <...> -> control: <test, check, guard, step>
Unverified: <links without evidence, and the probe that would settle each>
```

The report's `Why chain` line is the one-line summary of this tree.

## Gotchas

- The first plausible answer feels like the cause. Stopping there treats a
  symptom one level down.
- A why answered with a remedy ("because we have no retry") skips the
  mechanism; ask what actually happened.
- A person's mistake is never the last why: ask what let it through. A chain
  that ends at blame has stopped one link early.
- Jumping several levels in one answer ("why did the report fail? the
  process is broken") hides the links where the evidence would be.
- A link backed only by someone's account is evidence of what they saw;
  confirm the mechanism before building on it.
