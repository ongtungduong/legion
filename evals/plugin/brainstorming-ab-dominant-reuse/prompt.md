---
description: 'A/B case for the approach-choice step. What and why are given with the code; one approach clearly dominates: reuse the existing Redis-backed limiter keyed by user. Measures the approach-comparison message only.'
expected_outcome: 'Recommends the existing limiter helper on the exports route, keyed by req.user.id after requireAuth, 5 per minute; names what would flip it; builds nothing.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Write]
---

Someone scripted our `POST /api/exports` endpoint yesterday and started about 400 CSV exports in ten minutes. Each export runs a heavy report query, and the database fell over. I want to cap exports at 5 per minute per logged-in user. Our customers sit behind shared office IPs, so a per-IP limit would block whole companies. This is what we have:

```js
// src/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../redis.js';

export function limiter({ windowMs, max, prefix, keyGenerator }) {
  return rateLimit({
    windowMs,
    max,
    keyGenerator, // req.ip when undefined
    standardHeaders: true,
    store: new RedisStore({ sendCommand: (...args) => redis.call(...args), prefix }),
  });
}

// src/routes/auth.js
router.post('/login', limiter({ windowMs: 60_000, max: 10, prefix: 'rl:login:' }), login);

// src/routes/exports.js
router.post('/exports', requireAuth, createExport); // requireAuth sets req.user.id
```

We run 4 API instances behind a load balancer, all on the same Redis. What are my options, and which would you pick?
