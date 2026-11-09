# Receiving review feedback

Review feedback is a technical claim to evaluate, not an instruction to obey
or a social moment to manage.

## The pattern

1. **Read** all of it before reacting.
2. **Restate** each item as a technical requirement, or ask what it means.
3. **Verify** it against the code: is it true here?
4. **Evaluate**: is it right for this codebase, its constraints, its users?
5. **Respond** with a technical acknowledgment or reasoned pushback.
6. **Implement** one item at a time, each with its test, re-running the suite.

## Unclear items block everything

If any item is unclear, stop and ask about it before implementing *any* of
them; items are often related, and partial understanding produces the wrong
change. "I understand 1, 2, 3 and 6; I need clarification on 4 and 5 before
I start."

## By source

- **The user:** trusted; implement once understood, still ask if the scope is
  unclear.
- **External reviewers and bots:** check that the suggestion is correct for this
  codebase, does not break existing behavior, accounts for why the code is the
  way it is, and works on every supported platform. If it is wrong, push back
  with the reason. If you cannot verify it, say what you would need.

## Never

- "You're absolutely right!", "Great point!", or any performative agreement.
- Implementing a suggestion before verifying it.
- Silently skipping a comment. Every item gets a fix, a question, or a reasoned
  no.
