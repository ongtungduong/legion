// Shared helpers for Legion's repo checks. Zero dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SKILLS_DIR = path.join(ROOT, 'skills');
export const TRIGGERS_DIR = path.join(ROOT, 'evals', 'triggers');

// Minimal frontmatter parser for the YAML subset agentskills.io skills use:
// top-level `key: value` scalars, folded/literal block scalars (`>-`, `>`,
// `|-`, `|`), and one nested string map (`metadata:`). The authoritative spec
// check is skills/skill-creator/scripts/validate_skill.py; this parser only
// needs enough to read names and descriptions for repo-level checks.
const unquote = (v) =>
  (v.length >= 2 && v[0] === v[v.length - 1] && (v[0] === '"' || v[0] === "'")) ? v.slice(1, -1) : v;

export function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return { data: null, body: text, error: 'missing or unclosed frontmatter block' };
  const lines = match[1].split('\n');
  const data = {};
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw.trim() === '' || raw.trim().startsWith('#')) continue;
    const kv = raw.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) return { data: null, body: text, error: `frontmatter line ${i + 1} is not a top-level "key: value" pair` };
    const [, key, rest] = kv;
    const value = rest.trim();
    if (['>', '>-', '|', '|-'].includes(value)) {
      const block = [];
      while (i + 1 < lines.length && (lines[i + 1].trim() === '' || /^\s/.test(lines[i + 1]))) block.push(lines[++i].trim());
      data[key] = value.startsWith('>') ? block.join(' ').replace(/\s+/g, ' ').trim() : block.join('\n').trim();
    } else if (value === '') {
      const map = {};
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) {
        const sub = lines[++i].trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
        if (sub) map[sub[1]] = unquote(sub[2].trim());
      }
      data[key] = map;
    } else {
      data[key] = unquote(value);
    }
  }
  return { data, body: text.slice(match[0].length), error: null };
}

export function listSkills() {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function readSkill(name) {
  const file = path.join(SKILLS_DIR, name, 'SKILL.md');
  if (!fs.existsSync(file)) return null;
  const text = fs.readFileSync(file, 'utf8');
  return { name, file, text, bytes: Buffer.byteLength(text), ...parseFrontmatter(text) };
}

export function walk(dir, filter = () => true) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, filter));
    else if (filter(full)) out.push(full);
  }
  return out;
}

export const rel = (p) => path.relative(ROOT, p);
