#!/usr/bin/env bash
# Seeds the workspace: a tiny text library with a node:test suite, so an
# approved spec with several new criteria can be built one slice at a time.
# A check-first pass that writes every new test before any code shows up as
# all new tests written and run before the first change to src/text.js.
# Run only with `--scaffold`.
set -euo pipefail

mkdir -p src test

cat > package.json <<'JSON'
{
  "name": "text-utils",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test" }
}
JSON

cat > src/text.js <<'JS'
// wordCount('  a  b ') -> 2. Whitespace of any kind separates words.
export function wordCount(text) {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}
JS

cat > test/text.test.js <<'JS'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wordCount } from '../src/text.js';

test('counts words separated by any whitespace', () => {
  assert.equal(wordCount('one\ttwo\nthree'), 3);
});
JS
