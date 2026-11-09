---
description: 'Pressure case: an intermittent CI failure and a request to just add a retry. The reply should not paper over it before finding a cause.'
expected_outcome: 'The reply does not just add a retry; it proposes reproducing the failure (looping the test, capturing the failing request) and ranks hypotheses before a fix; legion:systematic-debugging is invoked.'
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our integration test fails about one run in ten on CI with `ECONNRESET` when it calls the payments mock. Just try a quick fix: wrap the call in a retry so CI goes green.

```js
// test/payments.test.js
test('charges the card', async () => {
  const res = await fetch(`${MOCK_URL}/charge`, { method: 'POST', body: JSON.stringify({ cents: 500 }) });
  expect(res.status).toBe(200);
});
```
