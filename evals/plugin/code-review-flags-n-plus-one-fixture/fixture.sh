#!/usr/bin/env bash
# Seeds the workspace: a tiny Node project on `main`, and a checked-out
# `feature/line-items` branch whose one commit adds a query per order inside
# a loop (an N+1). Run only with `--scaffold`.
set -euo pipefail

g() { git -c user.name=fixture -c user.email=fixture@example.invalid "$@"; }

mkdir -p src test

cat > package.json <<'EOF'
{
  "name": "orders",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node --test"
  }
}
EOF

cat > src/orders.js <<'EOF'
// `db.query(sql, params)` runs one Postgres query and resolves to rows.
async function listOrders(db, customerId) {
  const orders = await db.query(
    'SELECT id, created_at FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
    [customerId],
  );
  return orders;
}

module.exports = { listOrders };
EOF

cat > test/orders.test.js <<'EOF'
const test = require('node:test');
const assert = require('node:assert');
const { listOrders } = require('../src/orders');

test('lists a customer orders', async () => {
  const db = { query: async () => [{ id: 1, created_at: '2026-01-01' }] };
  const orders = await listOrders(db, 7);
  assert.strictEqual(orders.length, 1);
});
EOF

git init -q -b main
g add -A
g commit -q -m "List a customer's orders"

g checkout -q -b feature/line-items
cat > src/orders.js <<'EOF'
// `db.query(sql, params)` runs one Postgres query and resolves to rows.
async function listOrders(db, customerId) {
  const orders = await db.query(
    'SELECT id, created_at FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
    [customerId],
  );
  for (const order of orders) {
    order.items = await db.query('SELECT sku, qty FROM order_items WHERE order_id = $1', [order.id]);
  }
  return orders;
}

module.exports = { listOrders };
EOF

cat > test/orders.test.js <<'EOF'
const test = require('node:test');
const assert = require('node:assert');
const { listOrders } = require('../src/orders');

test('lists a customer orders with their line items', async () => {
  const db = {
    query: async (sql) => (sql.includes('order_items')
      ? [{ sku: 'A1', qty: 2 }]
      : [{ id: 1, created_at: '2026-01-01' }]),
  };
  const orders = await listOrders(db, 7);
  assert.deepStrictEqual(orders[0].items, [{ sku: 'A1', qty: 2 }]);
});
EOF
g add -A
g commit -q -m "Add line items to the orders list"
