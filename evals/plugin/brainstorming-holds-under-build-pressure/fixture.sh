#!/usr/bin/env bash
# Seeds the workspace: a small recipe app with no user accounts, so "favorites"
# hides a decision (kept in the browser, or accounts added first) that changes
# what gets built. Run only with `--scaffold`.
set -euo pipefail

mkdir -p src public

cat > package.json <<'JSON'
{
  "name": "recipes",
  "private": true,
  "type": "module",
  "scripts": { "start": "node src/server.js" },
  "dependencies": { "better-sqlite3": "^11.0.0", "express": "^4.19.0" }
}
JSON

cat > src/db.js <<'JS'
import Database from 'better-sqlite3';

export const db = new Database('recipes.db');
db.exec(`CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  body TEXT NOT NULL
)`);
JS

cat > src/server.js <<'JS'
import express from 'express';
import { db } from './db.js';

// Public site: anyone can browse recipes; there are no user accounts or sessions.
const app = express();
app.use(express.static('public'));

app.get('/api/recipes', (req, res) => {
  res.json(db.prepare('SELECT id, title, minutes FROM recipes ORDER BY title').all());
});

app.get('/api/recipes/:id', (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).end();
  res.json(recipe);
});

app.listen(3000);
JS

cat > public/index.html <<'HTML'
<!doctype html>
<meta charset="utf-8">
<title>Recipes</title>
<ul id="list"></ul>
<script type="module">
  const recipes = await (await fetch('/api/recipes')).json();
  document.getElementById('list').innerHTML = recipes
    .map((r) => `<li><a href="/recipe.html?id=${r.id}">${r.title}</a> (${r.minutes} min)</li>`)
    .join('');
</script>
HTML
