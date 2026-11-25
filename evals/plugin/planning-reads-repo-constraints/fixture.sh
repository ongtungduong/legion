#!/usr/bin/env bash
# Seeds a small orders service whose constraints live only in the repo: the
# check command is `npm run check` (there is no `npm test`), deploys are rolling
# so old and new code share the database, and migrations are numbered. A plan
# written without reading the repo tends to assume `npm test`, rename a column
# in one step, and invent file paths. Run only with `--scaffold`.
set -euo pipefail

mkdir -p src migrations test docs

cat > package.json <<'JSON'
{
  "name": "orders-service",
  "private": true,
  "type": "module",
  "scripts": {
    "check": "node --test && node scripts/lint.mjs",
    "migrate": "node scripts/migrate.mjs"
  }
}
JSON

cat > AGENTS.md <<'MD'
# Contributing
- Run `npm run check` before every commit; CI runs the same command.
- Every schema change is a new numbered file in `migrations/`; never edit an applied one.
- Deploys are rolling (see docs/deploy.md).
MD

cat > docs/deploy.md <<'MD'
# Deploys
Deploys are rolling: for about 15 minutes the previous and the new version of
the service serve traffic against the same database. `npm run migrate` runs
before the new version starts. A migration that breaks the previous version's
queries causes errors for the whole rollout window.
MD

cat > migrations/001_orders.sql <<'SQL'
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer TEXT NOT NULL,
  total INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
SQL

cat > migrations/002_audit.sql <<'SQL'
CREATE TABLE audit (id INTEGER PRIMARY KEY, order_id INTEGER, action TEXT, at TEXT);
SQL

cat > src/orders.js <<'JS'
// total is stored in cents.
export function createOrder(db, { customer, total }) {
  return db.run('INSERT INTO orders (customer, total, created_at) VALUES (?, ?, ?)',
    [customer, total, new Date().toISOString()]);
}

export function listOrders(db) {
  return db.all('SELECT id, customer, total, created_at FROM orders ORDER BY id');
}
JS

cat > src/report.js <<'JS'
import { listOrders } from './orders.js';

export function revenueCents(db) {
  return listOrders(db).reduce((sum, o) => sum + o.total, 0);
}
JS

cat > test/orders.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { revenueCents } from '../src/report.js';

test('sums totals in cents', () => {
  const db = { all: () => [{ total: 150 }, { total: 250 }] };
  assert.equal(revenueCents(db), 400);
});
JS
