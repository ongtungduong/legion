# PR body

Fill this in for the PR description. No preamble, short prose, terms from
`GLOSSARY.md`. Delete a section's optional lines rather than writing "n/a".

```markdown
## Summary

<one or two sentences, then the smallest visual that makes the change clear>

## Evidence

- **Before:** <the failing test, command output, or screenshot>
- **After:** <the same, passing>
- Verified: <the evidence gate's Verified line>

## Spec

<link to the spec or issue>; criteria -> tests: <each criterion -> its test>

## Merge danger

**Door:** one-way | two-way
**Blast radius:** <one phrase>
<optional: what could break outside the diff, and for whom>

## Rulings

<each `Ruling:` from the ledger, or delete this section>
```

## Picking the summary visual

Use the one that answers the reviewer's first question; one or two at most.

| The change is about | Show |
|---|---|
| Logic or an algorithm | Pseudocode |
| Runtime control flow | A call tree |
| UI structure | A component tree with the state and module boundaries that matter |
| File responsibilities, a broad refactor | A shallow file tree with one comment per entry |
| Interaction between parts | A Mermaid sequence or flow diagram |
| What changes inside an existing shape | A `diff` of that shape (call tree, file tree, component tree), not of the code |

A screenshot is the strongest evidence for a visual change; for anything
else, the failing-then-passing test is.

## Merge danger

- **Two-way door:** cheap to revert (a code-only change, a flag-guarded
  feature). **One-way door:** a revert does not undo it (a data migration,
  deleted data, a published API or event shape, an email sent).
- **Blast radius:** who or what feels it if it is wrong: callers of a
  changed signature, other services, persisted data, mobile clients, layout.
