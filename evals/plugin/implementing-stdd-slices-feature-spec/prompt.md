---
description: 'Fixture case, needs `--scaffold` and `--allow-tools Write Edit "Bash(node:*)" "Bash(npm:*)"`. An approved spec with four new criteria for a new function. The skill should build it in slices: the check for one criterion red, the change that makes it green, then the next criterion, instead of writing every new test before any code.'
expected_outcome: 'legion:implementing-stdd is invoked; the existing wordCount test is run before src/text.js changes; at least two new criteria are each written, run red, and made green before the check for a later criterion is written; the full suite passes with `npm test` at the end.'
max_turns: 30
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

This spec is approved, please implement it.

```markdown
# Spec: truncateWords - V1

## Objective
Show a short preview of a note in the list view.

## Success criteria
- truncateWords("a b c d", 2) returns "a b…".
- Text with n words or fewer comes back unchanged: truncateWords("a b", 2) returns "a b".
- Runs of whitespace in the preview collapse to one space: truncateWords("a \n b c", 2) returns "a b…".
- n must be a positive integer: truncateWords("a", 0) and truncateWords("a", 1.5) throw a RangeError.

## Boundaries
- Never: add dependencies, change wordCount.
```
