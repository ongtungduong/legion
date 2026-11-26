#!/usr/bin/env bash
# Seeds the workspace: a tiny duration library with a node:test suite, so an
# approved spec for a new function can be built check-first. The spec's edge
# cases (0, rounding, invalid input, round-trip) are what a code-first pass
# tends to leave untested. Run only with `--scaffold`.
set -euo pipefail

mkdir -p src test

cat > package.json <<'JSON'
{
  "name": "durations",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test" }
}
JSON

cat > src/duration.js <<'JS'
const UNITS = { h: 3600, m: 60, s: 1 };

// parseDuration('1h30m') -> 5400. Units must appear in h, m, s order.
export function parseDuration(text) {
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(text);
  if (!match || text === '') throw new RangeError(`bad duration: ${text}`);
  const [, h = 0, m = 0, s = 0] = match;
  return h * UNITS.h + m * UNITS.m + s * UNITS.s;
}
JS

cat > test/duration.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDuration } from '../src/duration.js';

test('parses hours and minutes', () => {
  assert.equal(parseDuration('1h30m'), 5400);
});

test('rejects unknown units', () => {
  assert.throws(() => parseDuration('5d'), RangeError);
});
JS
