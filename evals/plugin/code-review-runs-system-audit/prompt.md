---
description: 'A request to audit a whole repository for performance and security, with no diff. code-review should run both audits and report them under separate headings, not the Spec/Standards pair.'
expected_outcome: 'legion:code-review is invoked; the reply has both a "Security audit" and a "Performance audit" heading, in either order.'
max_turns: 16
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

Audit the whole repo for performance and security. These are all its source files:

```js
// src/server.js
const express = require('express');
const { listOrders } = require('./orders');
const app = express();
app.get('/customers/:id/orders', async (req, res) => res.json(await listOrders(req.params.id)));
app.listen(3000);
```

```js
// src/orders.js
const db = require('./db');
async function listOrders(customerId) {
  const orders = await db.query(`SELECT * FROM orders WHERE customer_id = ${customerId}`);
  for (const order of orders) {
    order.items = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  }
  return orders;
}
module.exports = { listOrders };
```
