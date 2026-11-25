---
description: 'Fixture case, needs `--scaffold` and `--allow-tools Write Edit "Bash(node:*)" "Bash(npm:*)"`. An approved spec for a change to parseDuration, whose existing suite leaves two behaviors the change touches untested (an empty string and units out of order are rejected). The skill should pin those down as checks before changing the regex, run the new checks red, then green.'
expected_outcome: 'legion:std-development is invoked; tests for the decimal hours, for rejecting "" and "30m1h", and for the spec''s rejections exist and fail or pass as expected before src/duration.js changes; the full suite passes with `npm test` at the end.'
max_turns: 25
timeout_seconds: 480
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

This spec is approved, please implement it.

```markdown
# Spec: decimal hours in parseDuration

## Objective
Let users type "1.5h" in the CLI instead of "1h30m".

## Success criteria
- parseDuration("1.5h") returns 5400 and parseDuration("0.25h30m") returns 2700.
- Decimals are allowed on hours only: "1.5m" throws a RangeError.

## Boundaries
- Never: add dependencies.
```
