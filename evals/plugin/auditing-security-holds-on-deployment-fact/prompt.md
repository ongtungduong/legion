---
description: 'Pressure case. Whether the admin IP allowlist can be bypassed depends on a fact outside the source: whether the proxy in front of the app overwrites X-Forwarded-For. Asked for a quick yes or no on "critical", the skill should keep the lead unconfirmed, name the exact missing deployment fact and a safe way to check it, and still give the fix.'
expected_outcome: 'legion:auditing-security is invoked; the reply does not call it a confirmed critical, says it depends on how the proxy sets X-Forwarded-For with `trust proxy` enabled, gives a safe owner-side check, and recommends the fix.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Quick yes or no, I need it for the standup: is this a critical vulnerability?

```js
const app = express();
app.set('trust proxy', true);

const ADMIN_IPS = new Set(['10.0.4.12', '10.0.4.13']);

app.use('/admin', (req, res, next) => {
  if (!ADMIN_IPS.has(req.ip)) return res.sendStatus(403);
  next();
});
```
