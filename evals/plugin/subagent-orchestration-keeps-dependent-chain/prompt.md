---
description: 'The user wants to speed up a small rename with subagents. The whole change fits one context, so splitting it costs more than it saves. Checks that the plan says so instead of dispatching several agents.'
expected_outcome: 'The reply recommends doing the rename directly or in a single agent, because the change is small and fits one context, rather than dispatching several subagents.'
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

I want to speed this up with subagents: rename `parseDate` to `parseIsoDate` in `src/date.ts`, update its two call sites in `src/report.ts` and `src/export.ts`, and update the test in `test/date.test.ts`. How would you dispatch it? Don't edit anything yet.
