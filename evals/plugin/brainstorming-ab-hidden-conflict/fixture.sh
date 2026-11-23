#!/usr/bin/env bash
# Seeds the workspace: a small users service where deleteUser has a second
# caller, the legal erasure worker with a 72-hour deadline. The prompt names
# only the account route, so the conflict shows up only to an agent that looks
# for every caller before it recommends. Run only with `--scaffold`.
set -euo pipefail

mkdir -p src/users src/routes src/privacy db

cat > src/users/deleteUser.js <<'JS'
import { db } from '../db.js';

// FKs: profiles and addresses ON DELETE CASCADE; orders.customer_id ON DELETE SET NULL
export async function deleteUser(userId) {
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}
JS

cat > src/users/findUser.js <<'JS'
import { db } from '../db.js';

export async function findUserByEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ?? null;
}
JS

cat > src/routes/account.js <<'JS'
import { router } from './router.js';
import { requireAuth } from '../auth.js';
import { deleteUser } from '../users/deleteUser.js';

router.delete('/account', requireAuth, async (req, res) => {
  await deleteUser(req.user.id);
  res.status(204).end();
});
JS

cat > src/privacy/erasureWorker.js <<'JS'
import { deleteUser } from '../users/deleteUser.js';
import { markErasureComplete } from './erasureLog.js';

// Processes data-subject erasure requests from the privacy inbox.
// Legal: personal data must be gone within 72 hours of the request (DPA, clause 7.2).
export async function handleErasureRequest(job) {
  await deleteUser(job.data.userId);
  await markErasureComplete(job.id);
}
JS

cat > db/schema.sql <<'SQL'
CREATE TABLE users (
  id         bigserial PRIMARY KEY,
  email      text NOT NULL UNIQUE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
SQL
