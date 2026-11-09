# Grilling

Interview the user until every open decision is resolved. Model the topic as a
**design tree**: every decision branches into the decisions that depend on it.
Recommend an answer for every question so the user can accept it in a word.

## Procedure

1. **Collect facts yourself first.** Read the code, files, and docs the topic
   touches. Never ask the user for something you can look up; dispatch a
   fresh, read-only `general-purpose` subagent on `model: "haiku"` for slow
   lookups and keep asking the questions that
   do not depend on them.
2. **Compute the frontier:** every open decision whose prerequisites are
   already settled.
3. **Ask the whole frontier as one round**, numbered, each with your
   recommendation, worded so "yes" accepts it. If the user's rules cap
   questions per message, ask the highest-leverage ones and carry the rest.
4. **Wait for the answers**, then recompute the frontier. A question that
   depends on one still open belongs to a later round.
5. **Use the project's vocabulary.** If `GLOSSARY.md` exists, phrase questions
   in its terms. When a term is fuzzy or contested, call the Skill tool with
   `legion:defining-terms`.
6. **Finish when the frontier is empty:** play the settled tree back in a short
   summary, listing any assumption you made so it can be rejected, and do not
   act on it until the user confirms it.

## Output format

```
**Q1 - <title>**: <question; when the choice can be named, the options and what each trades off>
Recommended: <answer> - <one-line reason>

**Q2 - <title>**: ...
Recommended: ...
```

## Gotchas

- Questions that depend on each other in the same round force the user to
  guess; keep dependent questions for the next round.
- A recommendation the user has not accepted is still open, however obvious
  it seems.
- A branch assumed silently is the failure grilling exists to prevent; put
  every assumption in the playback.
