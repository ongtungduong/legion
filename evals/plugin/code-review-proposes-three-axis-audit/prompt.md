---
description: 'A whole-repo review with no axis named. code-review should propose scope and budget across all three axes (system design, performance, security) and wait for approval instead of running an audit.'
expected_outcome: 'legion:code-review is invoked; the reply is a proposal naming system design, performance, and security, and waits for approval.'
max_turns: 16
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

Review this whole codebase. These are all its files.

```js
// src/server.js
const express = require('express');
const { checkout } = require('./orders');
const { renderInvoice } = require('./invoices');
const app = express();
app.post('/checkout', async (req, res) => res.json(await checkout(req.body)));
app.get('/invoices/:id', async (req, res) => res.json(await renderInvoice(req.params.id)));
app.listen(3000);
```

```js
// src/orders.js
const db = require('./db');
async function checkout({ customerId, items }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const order = { customerId, items, total };
  await db.insert('orders', order);
  return order;
}
module.exports = { checkout };
```

```js
// src/invoices.js
const db = require('./db');
async function renderInvoice(orderId) {
  const order = await db.find('orders', orderId);
  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal > 100 ? subtotal * 0.9 : subtotal;
  return { orderId, lines: order.items, total };
}
module.exports = { renderInvoice };
```
