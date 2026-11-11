---
description: 'A/B case for the approach-choice step. Soft delete with a 30-day restore, where the code shows the same deleteUser also serves legal erasure requests that must finish within 72 hours. The conflict must surface before the recommendation. Measures the approach-comparison message only.'
expected_outcome: 'Points out that erasureWorker calls deleteUser, so a 30-day soft delete would break the 72-hour erasure deadline, before recommending; recommends keeping erasure on a hard delete separate from the undoable account deletion; builds nothing.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Write]
---

Support restores accidentally deleted accounts by hand from backups, and each restore takes a day. I want account deletion to be undoable for 30 days: `deleteUser` should set `deleted_at` instead of deleting the row, support gets a restore endpoint that clears it, and a nightly job hard-deletes rows whose `deleted_at` is older than 30 days. This is the current code:

```js
// src/users/deleteUser.js
export async function deleteUser(userId) {
  // FKs: profiles and addresses ON DELETE CASCADE; orders.customer_id ON DELETE SET NULL
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}

// src/routes/account.js
router.delete('/account', requireAuth, async (req, res) => {
  await deleteUser(req.user.id);
  res.status(204).end();
});

// src/privacy/erasureWorker.js
// Processes data-subject erasure requests.
// Legal: personal data must be gone within 72 hours of the request (DPA, clause 7.2).
export async function handleErasureRequest(job) {
  await deleteUser(job.data.userId);
  await markErasureComplete(job.id);
}
```

Give me the approaches you see and which one you would go with.
