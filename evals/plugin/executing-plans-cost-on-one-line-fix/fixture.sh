#!/usr/bin/env bash
# Seeds the workspace: a tiny dependency-free Node project with a green suite
# (`node --test`) and one git commit. Run only with `--scaffold`.
set -euo pipefail

mkdir -p src test

cat > package.json <<'EOF'
{
  "name": "parcel-labels",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node --test"
  }
}
EOF

cat > src/parcel.js <<'EOF'
const HEAVY_KG = 20;

function isHeavy(weightKg) {
  return weightKg > HEAVY_KG;
}

function handlingLabel(weightKg) {
  return isHeavy(weightKg) ? 'TWO-PERSON LIFT' : 'STANDARD';
}

module.exports = { HEAVY_KG, isHeavy, handlingLabel };
EOF

cat > src/manifest.js <<'EOF'
const { handlingLabel } = require('./parcel');

function buildManifest(parcels) {
  return parcels.map((parcel) => ({
    id: parcel.id,
    label: handlingLabel(parcel.weightKg),
  }));
}

module.exports = { buildManifest };
EOF

cat > test/parcel.test.js <<'EOF'
const test = require('node:test');
const assert = require('node:assert');
const { isHeavy, handlingLabel } = require('../src/parcel');

test('a light parcel is not heavy', () => {
  assert.strictEqual(isHeavy(5), false);
});

test('a parcel well over the limit is heavy', () => {
  assert.strictEqual(isHeavy(25), true);
});

test('a parcel just under the limit gets the standard label', () => {
  assert.strictEqual(handlingLabel(19.9), 'STANDARD');
});

test('a parcel over the limit gets the two-person label', () => {
  assert.strictEqual(handlingLabel(25), 'TWO-PERSON LIFT');
});
EOF

cat > test/manifest.test.js <<'EOF'
const test = require('node:test');
const assert = require('node:assert');
const { buildManifest } = require('../src/manifest');

test('labels each parcel by weight', () => {
  const manifest = buildManifest([
    { id: 'a1', weightKg: 3 },
    { id: 'b2', weightKg: 30 },
  ]);
  assert.deepStrictEqual(manifest, [
    { id: 'a1', label: 'STANDARD' },
    { id: 'b2', label: 'TWO-PERSON LIFT' },
  ]);
});
EOF

git init -q
git add -A
git -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m "Initial commit"
