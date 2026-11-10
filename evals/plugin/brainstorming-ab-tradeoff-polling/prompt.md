---
description: 'A/B case for the approach-choice step. Live unread badge where the conventional answer (push over WebSockets) is wrong for the stated constraints: one-minute freshness, Lambda behind API Gateway, no new infrastructure. Polling the existing endpoint is right. Measures the approach-comparison message only.'
expected_outcome: 'Recommends polling the existing unread-count endpoint about every 30 to 60 seconds from HeaderBadge, not WebSockets, SSE, long polling, or a new service; names what would flip it; builds nothing.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Write]
---

Support tickets keep saying "I didn't see the new comment until I refreshed." I want the unread-comments badge in the dashboard header to update without a page reload. The PM confirmed that showing a new comment within a minute is fine; it does not need to be instant. Constraints: the API runs on AWS Lambda behind an API Gateway REST API (29-second integration timeout), and infrastructure has frozen new services and new AWS resources for this quarter, so no WebSocket API, no AppSync, no Redis, and no third-party push service. At peak about 300 dashboards are open at once.

```ts
// api/handlers/unreadCount.ts
export const handler = async (event) => {
  const userId = event.requestContext.authorizer.userId;
  const { rows } = await db.query(
    // partial index on comment_reads (user_id) WHERE read_at IS NULL
    'SELECT count(*) FROM comment_reads WHERE user_id = $1 AND read_at IS NULL',
    [userId],
  );
  return { statusCode: 200, body: JSON.stringify({ unread: Number(rows[0].count) }) };
};

// web/src/components/HeaderBadge.tsx
export function HeaderBadge() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    fetch('/api/unread-count').then((r) => r.json()).then((d) => setUnread(d.unread));
  }, []);
  return <Badge count={unread} />;
}
```

What approaches do I have, and which one do you recommend?
