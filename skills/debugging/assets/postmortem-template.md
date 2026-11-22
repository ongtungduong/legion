# Postmortem: <short title of the incident>

**Date:** <YYYY-MM-DD of the incident>
**Authors:** <names or roles>
**Status:** <Draft | In review | Final, action items in progress | Complete>
**Summary:** <One or two sentences: what failed, the impact, how it was resolved.>

Blameless: causes are systems, processes, and missing defenses, never people.
Where a person's action appears, the question is what let it through.

## Impact
Who and what was affected, for how long, and how much: people, requests or
transactions, money, data, service-level targets, people's time. Numbers
where they exist, with their source.

## Causes and contributing factors
The five-whys tree: the trigger, the latent conditions that let it become a
failure, and each "why was this possible?" link down to the causes the team
controls, each with its evidence. Keep every branch; a complex failure rarely
has a single root cause. Mark any link that is not verified.

## Trigger
The event or change that set off the latent cause, and when.

## Resolution
What contained the damage and when, then what fixed the cause and when.

## Detection
How and when the problem was noticed, by whom or by what, and how it could
have been noticed sooner.

## Action items
Every contributing cause and every "what went wrong" maps to at least one item.

| Action | Type | Owner | Ticket | Due | Status |
|---|---|---|---|---|---|
| <action> | <mitigate / prevent / detect / process> | <owner> | <link> | <date> | <open / done> |

## Lessons learned

### What went well

### What went wrong

### Where we got lucky
Things that limited the damage by chance rather than by design; each is a
candidate action item.

## Timeline
All times in <timezone>. Mark the start of impact, detection, containment,
resolution, and end of impact.

- <HH:MM> <what happened> (<source: log, alert, message, person>)

## Supporting information
Links to the loop and its output, dashboards, logs, tickets, and messages,
with secrets and personal data redacted.
