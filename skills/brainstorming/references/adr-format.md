# ADR format

ADRs live in `docs/adr/` as `0001-slug.md`, `0002-slug.md`, and so on. Scan
the directory for the highest number and add one. Create the directory only
when the first ADR is needed.

```markdown
# <Short title of the decision>

<One to three sentences: the context, what we decided, and why.>
```

That is the whole template. An ADR can be one paragraph: its value is
recording *that* a decision was made and *why*.

Optional sections, only when they add real value:

- **Status** (`proposed | accepted | deprecated | superseded by ADR-NNNN`)
  when decisions get revisited.
- **Considered options** when the rejected alternatives are worth remembering.
- **Consequences** when downstream effects are not obvious.

## What qualifies

- Architectural shape ("the write model is event-sourced").
- Integration patterns between contexts ("Ordering and Billing talk through
  events, not synchronous HTTP").
- Technology choices with lock-in (database, message bus, auth provider).
- Boundary and scope decisions, including the explicit no's.
- Deliberate deviations from the obvious path ("hand-written SQL instead of an
  ORM because ..."), so nobody "fixes" them later.
- Constraints invisible in the code (compliance, partner SLAs).
