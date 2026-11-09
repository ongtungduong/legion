---
description: A pasted diff with a commit-message request. Guards the "including when the diff is pasted inline" clause of the code-review description; a pasted diff alone must not make the review skill fire.
expected_outcome: A commit message; legion:code-review is never invoked.
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Write me a commit message for this diff.

```diff
diff --git a/src/orders.js b/src/orders.js
--- a/src/orders.js
+++ b/src/orders.js
@@ -12,3 +12,9 @@ function listOrders(db) {
   return db.query('SELECT * FROM orders ORDER BY created_at DESC');
 }
-module.exports = { listOrders };
+function pageOrders(db, page, size) {
+  const rows = db.query('SELECT * FROM orders ORDER BY created_at DESC');
+  const start = (page - 1) * size;
+  return rows.slice(start, start + size);
+}
+
+module.exports = { listOrders, pageOrders };
```
