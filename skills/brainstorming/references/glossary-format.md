# Glossary

Settle the project's words while grilling, and write each settled one down so
code, docs, and conversation use the same name for the same thing.

## When a term needs work

- One word used for two concepts ("account" meaning both the login and the
  paying company).
- Two words used for one concept ("customer" and "client").
- A fuzzy term the design depends on: the answer to an open decision changes
  with what the word means.
- A conflict with an existing entry or with the names in the code.

## Procedure

1. **Challenge it as a grilling question**, in the current round: "By
   *account*, do you mean the Customer or the User?" Recommend one canonical
   term, and give a concrete scenario that forces the boundary ("an order
   shipped in two parcels, one returned: is that a partial cancellation?").
2. **Cross-check the code.** If its names contradict the term the user picks,
   say so; renaming code is a separate decision.
3. **Record the term once the user confirms it**, right then; terms batched
   until the end get lost. A definition the user has not confirmed is a
   proposal: list it in the playback, not in the file.

## Where it lives

`GLOSSARY.md` at the repo root, unless the repo already keeps one elsewhere.
A `GLOSSARY-MAP.md` at the root means one glossary per bounded context: read
it and write to that context's file. Create the file only when the first term
is confirmed; with nothing to record, create nothing.

## Format

```markdown
# <Context name>

<One or two sentences: what this context is and why it exists.>

## Language

**Order**:
A customer's request to buy one or more products, from placement to delivery.
_Avoid_: Purchase, transaction
```

## Rules

- **Be opinionated.** Pick one word per concept; list the rejected ones under
  `_Avoid_`.
- **One or two sentences**, saying what the thing *is*, not what it does or
  how it is built. Implementation notes and specs in a glossary go stale and
  mislead.
- **Project terms only.** General programming concepts (timeout, retry, error
  type) stay out, however often the project uses them.
- **Group under subheadings** once natural clusters appear.
