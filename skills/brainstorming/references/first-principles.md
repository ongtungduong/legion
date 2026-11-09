# First-principles pass

Run this after the intent is played back and before laying out approaches.
Its job is to stop the approaches from being copies of the obvious solution
when the obvious solution rests on an assumption nobody checked.

## Procedure

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
4. **Rebuild from the remaining truths:** sketch the simplest approach that
   satisfies every fact and constraint and nothing else. It becomes one of the
   candidates in "Lay out the approaches", next to the conventional one.
5. **Check the rebuild against the existing system.** Existing code, data, and
   contracts are facts, not assumptions. Reusing what is there is often the
   first-principles answer; a rewrite needs a fact that forces it.

## Output format

```
Goal: <one sentence, no solution words>
Must be true:
- <fact> (source: <file, doc, or "user said">)
- <hard constraint> (why it binds)
Assumptions questioned:
- "<assumption>" -> keep: forced by <fact/constraint>
- "<assumption>" -> drop: convention only
- "<assumption>" -> ask: only the user can say
Rebuilt approach: <two or three lines>
```

## Gotchas

- First principles is not "rebuild everything from scratch". It questions what
  the request assumes, not what the system already guarantees.
- An assumption the user stated as a requirement is still worth one question
  when nothing visible forces it: "Does it have to be real time, or is a
  five-minute delay fine?"
- Stop at the level where the answer changes what gets built. Decomposing past
  that point produces philosophy, not design.
