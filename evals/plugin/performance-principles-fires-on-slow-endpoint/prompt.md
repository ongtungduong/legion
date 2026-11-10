---
description: 'A slow endpoint with a per-order query inside a loop. The skill should fire, fix the N+1 with one batched query or join, and talk about measuring instead of inventing a speedup.'
expected_outcome: 'The per-order items query is replaced by one batched query or join; the reply says how to measure before and after; no speedup figure is claimed without a measurement; legion:performance-principles is invoked.'
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill]
---

This endpoint takes about 3 seconds for a customer with a few hundred orders. Make it faster.

```js
// src/routes/orders.js
async function listOrders(req, res, db) {
  const orders = await db.query(
    'SELECT id, created_at, total_cents FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
    [req.params.customerId],
  );
  for (const order of orders) {
    order.items = await db.query(
      'SELECT sku, qty, price_cents FROM order_items WHERE order_id = $1',
      [order.id],
    );
  }
  res.json(orders);
}
module.exports = { listOrders };
```
