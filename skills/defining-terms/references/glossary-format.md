# GLOSSARY.md format

```markdown
# <Context name>

<One or two sentences: what this context is and why it exists.>

## Language

**Order**:
A customer's request to buy one or more products, from placement to delivery.
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request
```

## Rules

- **Be opinionated.** When several words exist for one concept, pick the best
  and list the rest under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Say what the thing *is*,
  not what it does.
- **Only project-specific terms.** General programming concepts (timeouts,
  retries, error types) do not belong, however often the project uses them.
- **Group under subheadings** when natural clusters appear; a flat list is
  fine otherwise.

## Multiple contexts

A `GLOSSARY-MAP.md` at the repo root lists the contexts and their relations:

```markdown
# Glossary Map

## Contexts
- [Ordering](./src/ordering/GLOSSARY.md): receives and tracks customer orders
- [Billing](./src/billing/GLOSSARY.md): generates invoices and takes payments

## Relationships
- **Ordering -> Billing**: Ordering emits `OrderPlaced`; Billing consumes it
```

If the map exists, read it to find the right context. If only a root
`GLOSSARY.md` exists, there is one context. If neither exists, create a root
`GLOSSARY.md` when the first term is resolved.
