---
description: A pasted diff with a "what broke?" question. Guards the "even when the code is pasted inline and the fix looks obvious" clause of the systematic-debugging description.
expected_outcome: A diagnosis that the slice end is exclusive, so every page loses a row, grounded in a reproduction (the failing test or a minimal check) before the fix; legion:systematic-debugging is invoked.
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

The orders page test started failing right after this change: it expects 20 rows and gets 19. Here is the diff. What broke?

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
+  return rows.slice(start, start + size - 1);
+}
+
+module.exports = { listOrders, pageOrders };
```
