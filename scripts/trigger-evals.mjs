#!/usr/bin/env node
// Lexical trigger evals (deterministic, CI-safe, zero dependencies).
//
// Idea from addyosmani/agent-skills (Tier 2): score each prompt against every
// skill description with TF-IDF cosine similarity.
//   - every positive prompt must rank its skill within top_k (default 3);
//   - every negative prompt must not rank the skill #1;
//   - no two descriptions may be near-duplicates.
// This approximates routing by vocabulary only. It catches descriptions that
// lack the words users say and descriptions that are too broad; it cannot
// judge semantics. Behavioral checks need a real model (see docs/roadmap.md).
import fs from 'node:fs';
import path from 'node:path';
import { TRIGGERS_DIR, ROUTER, listSkills, readSkill } from './lib/skills.mjs';

const DEFAULT_TOP_K = 3;
const COLLISION = 0.5;
const MIN_POSITIVE = 3;
const MIN_NEGATIVE = 2;

const STOP = new Set(('a an and are as at be before by can do does for from has have how i if in into is it its ' +
  'me my no not of on or our so that the their them then there this to us use used was we what when where which ' +
  'while who why will with you your any about after all also been being but each even just more most only other ' +
  'over same some such than too very want wants need needs please').split(' '));

function stem(w) {
  for (const suf of ['ations', 'ation', 'ings', 'ing', 'ies', 'ied', 'ers', 'er', 'ed', 'es', 'ly', 's']) {
    if (w.length > suf.length + 3 && w.endsWith(suf)) {
      const base = w.slice(0, -suf.length);
      return suf === 'ies' || suf === 'ied' ? base + 'y' : base;
    }
  }
  // Drop a trailing "e" so "change" and "changing" share a stem.
  return w.length > 4 && w.endsWith('e') ? w.slice(0, -1) : w;
}
const tokens = (text) => text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t && !STOP.has(t)).map(stem);

const errors = [];
const skills = listSkills().filter((s) => {
  if (s === ROUTER) return false;
  if (readSkill(s)?.data?.description) return true;
  errors.push(`${s}: frontmatter does not parse; run npm run validate`);
  return false;
});
const docs = Object.fromEntries(skills.map((s) => [s, tokens(`${s.replace(/-/g, ' ')} ${readSkill(s).data.description}`)]));

const df = new Map();
for (const toks of Object.values(docs)) for (const t of new Set(toks)) df.set(t, (df.get(t) ?? 0) + 1);
const N = skills.length;
const idf = (t) => Math.log((N + 1) / ((df.get(t) ?? 0) + 1)) + 1;

function vector(toks) {
  const tf = new Map();
  for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
  const v = new Map();
  for (const [t, c] of tf) v.set(t, (1 + Math.log(c)) * idf(t));
  return v;
}
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const [t, x] of a) { na += x * x; if (b.has(t)) dot += x * b.get(t); }
  for (const x of b.values()) nb += x * x;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
const vecs = Object.fromEntries(skills.map((s) => [s, vector(docs[s])]));
const rank = (prompt) => {
  const v = vector(tokens(prompt));
  return skills.map((s) => [s, cosine(v, vecs[s])]).sort((a, b) => b[1] - a[1]);
};

const notes = [];
const VERBOSE = process.argv.includes('--verbose');
let positives = 0, rank1 = 0;

for (const s of skills) {
  const file = path.join(TRIGGERS_DIR, `${s}.json`);
  if (!fs.existsSync(file)) { errors.push(`${s}: missing evals/triggers/${s}.json`); continue; }
  const cases = JSON.parse(fs.readFileSync(file, 'utf8'));
  const pos = cases.positive ?? [];
  const neg = cases.negative ?? [];
  if (pos.length < MIN_POSITIVE) errors.push(`${s}: needs at least ${MIN_POSITIVE} positive prompts`);
  if (neg.length < MIN_NEGATIVE) errors.push(`${s}: needs at least ${MIN_NEGATIVE} negative prompts`);

  for (const c of pos) {
    const prompt = typeof c === 'string' ? c : c.prompt;
    const k = (typeof c === 'object' && c.top_k) || DEFAULT_TOP_K;
    const ranked = rank(prompt);
    const r = ranked.findIndex(([name]) => name === s) + 1;
    positives++;
    if (r === 1) rank1++;
    else notes.push(`${s}: ranked #${r} for "${prompt}" (top: ${ranked[0][0]})`);
    if (r > k) errors.push(`${s}: positive ranked #${r} (> top ${k}): "${prompt}" -> top: ${ranked.slice(0, 3).map(([n]) => n).join(', ')}`);
  }
  for (const c of neg) {
    if (c.owner && !skills.includes(c.owner) && c.owner !== ROUTER) errors.push(`${s}: negative owner "${c.owner}" is not a skill`);
    const top = rank(c.prompt)[0][0];
    if (top === s) errors.push(`${s}: negative prompt ranked this skill #1: "${c.prompt}"`);
  }
}

for (let i = 0; i < skills.length; i++) {
  for (let j = i + 1; j < skills.length; j++) {
    const sim = cosine(vecs[skills[i]], vecs[skills[j]]);
    if (sim > COLLISION) errors.push(`descriptions too similar (${sim.toFixed(2)} > ${COLLISION}): ${skills[i]} / ${skills[j]}`);
  }
}

if (VERBOSE) for (const n of notes) console.log(`NOTE  ${n}`);
for (const e of errors) console.log(`ERROR ${e}`);
const pct = positives ? ((100 * rank1) / positives).toFixed(1) : '0.0';
console.log(`trigger-evals: ${skills.length} skills, ${positives} positive prompts, rank-1 ${rank1}/${positives} (${pct}%), ${errors.length} errors`);
process.exit(errors.length ? 1 : 0);
