---
description: 'A request to audit the system design of a whole repository, with scope and budget approved in the prompt. code-review should run the system-design audit and report the two sources of truth for the order total as a rule-backed finding.'
expected_outcome: 'legion:code-review is invoked; the reply has a "System design audit" heading that reports the order total computed in both src/orders.js and src/invoices.js, cites a system-design rule, and labels it Important or Critical.'
max_turns: 16
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

Audit the system design of this whole repo. These are all its files. Scope and budget are approved; run it now.

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
