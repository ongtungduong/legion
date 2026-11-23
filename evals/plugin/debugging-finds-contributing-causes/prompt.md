---
description: 'An incident with several causes that line up. Measures whether the reply keeps every contributing cause and aims a control at each one the team controls, instead of naming a single culprit.'
expected_outcome: 'legion:debugging is invoked; the reply names the pool reduction, the traffic spike, and the health check sharing the pool as causes on one chain, and proposes controls (saturation alert, separate health check, realistic load test or capacity review) rather than blaming a person.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill]
---

Last night our checkout API was down for 40 minutes. What we know:

- 21:02: a deploy cut the database connection pool from 50 to 10 to save cost (approved in a ticket).
- 21:15: a marketing email went out and traffic tripled.
- 21:17: the pool was exhausted and requests queued. The health check uses the same pool, so it failed, and the load balancer removed every instance, which made it worse.
- 21:57: we restarted the instances and it recovered.
- We have no alert on pool saturation, and our load tests run at 5% of real traffic.

Find out why it went down and what we should change.
