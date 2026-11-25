# Spec: <name> - V<n>

Status: proposed | approved | implemented
Source: <design doc, plan step, ticket, or "request of YYYY-MM-DD">

## Objective

<What changes and why, for whom. One short paragraph.>

## Criteria

Each line is a situation and its expected result, specific enough to check.

### New

1. <situation> -> <expected result>

### Unchanged

1. <existing behavior the change touches> -> <result it keeps>

### My call (confirm or correct)

1. <open case> -> <assumed result> (why this answer)

## Checks

How the criteria are checked and the commands that run them.

- Focused: `<command that runs only the new and touched checks>`
- Full: `<the project's full check command>`

## Boundaries

- Always: <what every change here does, e.g. run the full suite before hand-off>
- Ask first: <changes that need the user's go-ahead, e.g. new dependencies, schema or format changes>
- Never: <e.g. edit generated or vendored files, weaken a check to pass>

## Out of scope (Deferred)

- <idea> - <why it waits>

## Open questions

- <anything only the user can decide>

---

<!-- Delta form, for a change to work that already shipped with a spec.
Save it next to the original as <original-name>-<change>.md. -->

# Spec delta: <change name>

Status: proposed | approved | implemented
Changes: <link to the original spec and section>

## Objective

<The change and why; the deferred item or new requirement it implements.>

## Current behavior

<What is true today, with a link to the original spec's lines.>

## Criteria

### New
1. <situation> -> <expected result>

### Unchanged
1. <behavior that must survive the change> -> <result>

### My call (confirm or correct)
1. <open case> -> <assumed result>

## Boundaries

<Only what differs from the original spec; the rest is inherited.>

<!-- When the change ships: fold it into the original spec, bump its V<n>,
and set this delta's Status to implemented. -->
