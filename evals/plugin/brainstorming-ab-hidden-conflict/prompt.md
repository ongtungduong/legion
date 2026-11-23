---
description: 'A/B case for the approach-choice step, needs `--scaffold`. Soft delete with a 30-day restore; the workspace shows that the same deleteUser also serves legal erasure requests that must finish within 72 hours, but the prompt names only the account route. The conflict must surface before the recommendation. Measures the approach-comparison message only.'
expected_outcome: 'Looks up the callers of deleteUser, points out that handleErasureRequest calls it, so a 30-day soft delete would break the 72-hour erasure deadline, before recommending; recommends keeping erasure on a hard delete separate from the undoable account deletion; builds nothing.'
max_turns: 12
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, Write]
---

Support restores accidentally deleted accounts by hand from backups, and each restore takes a day. I want account deletion (`DELETE /account`) to be undoable for 30 days: `deleteUser` should set `deleted_at` instead of deleting the row, support gets a restore endpoint that clears it, and a nightly job hard-deletes rows whose `deleted_at` is older than 30 days. The code is in this repo.

Give me the approaches you see and which one you would go with.
