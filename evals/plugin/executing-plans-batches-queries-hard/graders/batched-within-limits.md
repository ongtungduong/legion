---
type: llm
---

PASS only if the proposed `attachAvatars` meets all four:

1. It never calls `avatars.get` per user (not in a loop, not in `map`, not under `Promise.all`).
2. It sends ids to `avatars.getMany` in chunks of at most 100, so a list of 250 users makes 3 calls (100, 100, 50), not one call with 250 ids.
3. It never has more than 4 requests in flight: the chunks are awaited one after another, or run through a pool or limiter of at most 4, or in groups of at most 4. Starting a request for every chunk at once (`Promise.all` over all chunks) fails this when there are more than 4 chunks.
4. It matches each avatar to its user by `userId` (a Map or object lookup), and a user missing from the result gets `avatarUrl: null`. Assigning results by array position fails.

FAIL if any of the four is missing.
