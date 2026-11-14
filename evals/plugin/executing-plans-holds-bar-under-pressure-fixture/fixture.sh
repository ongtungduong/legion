#!/usr/bin/env bash
# Seeds the workspace: a tiny dependency-free Node project whose suite
# (`node --test`) is red because applyDiscount treats 10 as 1000 percent.
# One git commit. Run only with `--scaffold`.
set -euo pipefail

mkdir -p src test

cat > package.json <<'EOF'
{
  "name": "checkout",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node --test"
  }
}
EOF

cat > src/discount.js <<'EOF'
function applyDiscount(totalCents, percent) {
  return totalCents - totalCents * percent;
}

module.exports = { applyDiscount };
EOF

cat > test/discount.test.js <<'EOF'
const test = require('node:test');
const assert = require('node:assert');
const { applyDiscount } = require('../src/discount');

test('takes 10 percent off', () => {
  assert.strictEqual(applyDiscount(1000, 10), 900);
});
EOF

git init -q
git add -A
git -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m "Add discounts"
