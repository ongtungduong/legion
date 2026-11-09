---
description: A review request with a small diff inline. The skill should fire, and the reply should keep the Spec and Standards axes separate and use Legion's severity labels.
expected_outcome: A review with separate Spec and Standards sections, findings labelled Critical / Important / Minor / FYI, and the off-by-one in pageOrders filed as Critical or Important; legion:code-review is invoked.
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff before I merge it. It adds paging to the orders endpoint.

```diff
diff --git a/src/orders.js b/src/orders.js
--- a/src/orders.js
+++ b/src/orders.js
@@ -12,3 +12,15 @@ function listOrders(db) {
   return db.query('SELECT * FROM orders ORDER BY created_at DESC');
 }
-module.exports = { listOrders };
+function pageOrders(db, page, size) {
+  const rows = db.query('SELECT * FROM orders ORDER BY created_at DESC');
+  const start = (page - 1) * size;
+  return rows.slice(start, start + size - 1);
+}
+
+app.get('/orders', (req, res) => {
+  const page = Number(req.query.page) || 1;
+  const size = Number(req.query.size) || 20;
+  res.json(pageOrders(db, page, size));
+});
+
+module.exports = { listOrders, pageOrders };
```
