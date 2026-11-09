---
description: 'A diff that adds a query per order inside a loop. The Standards axis must flag it as a performance problem at Important or above.'
expected_outcome: The review's Standards section flags the per-order query in the loop as Important or Critical with a file:line location; legion:code-review is invoked.
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

Review this diff before I merge it. It adds line items to the orders list.

```diff
diff --git a/src/orders.js b/src/orders.js
--- a/src/orders.js
+++ b/src/orders.js
@@ -3,6 +3,11 @@ async function listOrders(db, customerId) {
   const orders = await db.query(
     'SELECT id, created_at FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
     [customerId],
   );
+  for (const order of orders) {
+    order.items = await db.query('SELECT sku, qty FROM order_items WHERE order_id = $1', [order.id]);
+  }
   return orders;
 }
```
