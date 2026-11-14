#!/usr/bin/env bash
# Seeds the workspace: a tiny dependency-free Node project whose data access
# goes through an injected `db.query(sql, params)`, with a green suite
# (`node --test`) and one git commit. Run only with `--scaffold`.
set -euo pipefail

mkdir -p src test

cat > package.json <<'EOF'
{
  "name": "shop-reports",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node --test"
  }
}
EOF

cat > src/customers.js <<'EOF'
// Data access takes `db` as a parameter: `db.query(sql, params)` runs one
// Postgres query and resolves to an array of row objects.
async function findCustomer(db, id) {
  const rows = await db.query('SELECT id, name FROM customers WHERE id = $1', [id]);
  return rows[0] ?? null;
}

module.exports = { findCustomer };
EOF

cat > test/customers.test.js <<'EOF'
const test = require('node:test');
const assert = require('node:assert');
const { findCustomer } = require('../src/customers');

// A stub db records every query and answers from canned rows.
function stubDb(rows) {
  const calls = [];
  return { calls, query: async (sql, params) => { calls.push({ sql, params }); return rows; } };
}

test('finds a customer by id', async () => {
  const db = stubDb([{ id: 1, name: 'Ada' }]);
  assert.deepStrictEqual(await findCustomer(db, 1), { id: 1, name: 'Ada' });
  assert.strictEqual(db.calls.length, 1);
});

test('returns null for an unknown id', async () => {
  assert.strictEqual(await findCustomer(stubDb([]), 99), null);
});
EOF

git init -q
git add -A
git -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m "Initial commit"
