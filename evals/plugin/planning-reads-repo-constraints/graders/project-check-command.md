---
type: llm
---

The repo has no `npm test` script; its check command is `npm run check` (AGENTS.md and package.json).

PASS if the plan's verification steps use `npm run check` (or its parts `node --test` and `node scripts/lint.mjs`) and never tell the executor to run `npm test`.

FAIL if any step tells the executor to run `npm test`, or no step names a command to verify the work.
