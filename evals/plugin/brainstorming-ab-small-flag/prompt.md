---
description: 'A/B case for the approach-choice step. A small change, machine-readable output for one CLI command, where heavy analysis is wrong-sized and widening the scope to every command is a trap. Measures the approach-comparison message only.'
expected_outcome: 'Recommends a --json (or --output json) flag on status that prints the same services as JSON, table stays the default; the reply is short; names what would flip it; builds nothing.'
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Write]
---

Our CI wants to parse the output of `deployctl status`, which today only prints a table for humans. I want a machine-readable option so the pipeline can read each service's name, version, and health. The table must stay the default because people run the command every day. This is the command:

```ts
// src/commands/status.ts
export const status = new Command('status')
  .description('Show deployed services')
  .option('-e, --env <env>', 'environment', 'staging')
  .action(async (opts) => {
    const services = await api.listServices(opts.env); // [{ name, version, health, updatedAt }]
    printTable(services, ['name', 'version', 'health', 'updatedAt']);
  });
```

The other commands (`deployctl logs`, `deployctl releases`) also print only tables. What are the options, and which do you suggest?
