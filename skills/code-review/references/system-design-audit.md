# System design audit

Read this when asked to audit the system design or architecture of a
whole repository, system, or directory (not a diff). A design finding is a
rule broken plus what happens because of it: a diagram that looks wrong
but breaks nothing is a smell, not a defect.

## Procedure

1. **Read the rules.** Read the `system-design.md` reference of the
   `principles` skill (absolute path given in the dispatch), especially its
   final checklist: every finding quotes one rule from it.
2. **Scope and baseline.** Name the paths and entry points. Read the
   baseline: ADRs, `docs/`, architecture notes, so a recorded decision is
   not reported as a mistake.
3. **Map the system.** Record, from source: the modules and what each owns;
   dependency direction and any cycles; which module owns each business
   rule and each piece of state; the source of truth for each fact and its
   derived copies; data stores and who writes to them; external calls and
   how each handles timeout, retry, and failure.
4. **Check the map against the checklist.** For each rule, look for the
   places the map breaks it: a rule or state with two owners, a dependency
   pointing away from policy, two sources of truth for one fact, a retried
   operation that is not idempotent, an outbound call with no timeout, an
   unbounded queue or cache, a failure no operator can trace.
5. **Name the consequence.** Each candidate needs one concrete scenario: a
   failure ("when the payment API times out, the order stays pending
   forever"), a consistency scenario (two copies of a stock count that
   diverge when one write fails), or a change scenario ("adding a field touches
   seven modules"). Put it in the `Impact` column. No consequence: at most
   Minor.
6. **Verify each finding.** Confirm in the code that nothing already
   prevents the scenario (a transaction, a shared helper, a gateway
   timeout). Drop what fails; move what you cannot settle to Not checked.
7. **Fix and rank.** Order by severity, then by how many modules the break
   touches. Each fix is the smallest change that restores the rule, with
   its cost; never a rewrite proposal without one. Fold more than five
   Minor findings into one line per module.

## Report

```
### Scope
<paths, entry points, modules; baseline read>
### Method
<what was mapped and how, what was read from source only>
### Findings
| Severity | Location | Finding | Evidence | Impact |
|---|---|---|---|---|
| Important | src/stock.js:30, src/checkout.js:14 | stock level kept in two tables | checkout decrements its own copy, warehouse sync writes the other | consistency: checkout sells items the warehouse no longer has |
### Not checked
<what was out of reach, and what would settle it>
```

Severity: Critical (data loss or inconsistency, or an outage at current
load), Important (breaks under the expected growth or a likely failure),
Minor (a smell with no consequence yet), FYI (context only).
