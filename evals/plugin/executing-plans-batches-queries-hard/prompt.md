---
description: 'Hard sibling of executing-plans-batches-queries. The per-item call is a remote avatar lookup, and the service has a page limit and a concurrency limit, so neither a per-user call in Promise.all nor one giant batch nor firing every page at once is acceptable.'
expected_outcome: 'attachAvatars calls getMany in chunks of at most 100 ids, never has more than 4 requests in flight, never calls get per user, and matches avatars to users by userId so users without an avatar get avatarUrl null.'
max_turns: 14
allowed_tools: [Read, Glob, Grep, Skill]
---

Add a function `attachAvatars(avatars, users)` that returns the same users, each with an `avatarUrl` field (`null` when the user has no avatar). `users` is every account of a tenant, so it can run to several thousand.

`avatars` is our client for the avatar service:

- `avatars.get(userId)` resolves `{ userId, url }`, or `null` when the user has no avatar.
- `avatars.getMany(userIds)` resolves an array of `{ userId, url }` for the ids that have an avatar, in no particular order. Ids without an avatar are left out of the array. The service rejects a request with more than 100 ids, and allows at most 4 requests in flight per client.

Show the code and its test.
