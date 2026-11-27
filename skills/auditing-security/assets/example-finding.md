# Worked finding (guidance mode)

Request: "Is `GET /invoices/{id}` exploitable? The handler loads the invoice
by id and returns it."

```
Finding: another tenant's invoice can be read (IDOR)
Boundary: principal = authenticated user of tenant A; input = path id; intended control = invoices are visible only to their own tenant; crossed boundary = tenant isolation; affected resource = invoice rows of tenant B; observed result = 200 with tenant B's invoice when tenant A requests its id
Trace: api/invoices.py:27 `Invoice.get(id)` -> no tenant filter; the auth middleware at api/auth.py:14 sets `request.user` but nothing at db/models.py:63 scopes queries by `user.tenant_id`
Verdict: confirmed, high (needs an account; ids are sequential, so enumeration is cheap)
Fix: `Invoice.get(id, tenant_id=request.user.tenant_id)` and return 404 on a miss, so existence does not leak; add a test that tenant A gets 404 for tenant B's id
```

A claim without a reachable path stays `needs_validation`, naming the exact
unresolved fact (for example "whether the gateway injects a tenant filter").
