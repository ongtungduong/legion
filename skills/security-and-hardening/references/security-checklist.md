# Security checklist

Mark each item checked, not applicable, or failed, with evidence.

## Input and output
- [ ] All external input validated at the boundary (shape, length, enum, format)
- [ ] No string-built SQL, NoSQL, shell, or file paths from input
- [ ] Output encoded; no raw HTML from user data without an allowlist sanitizer
- [ ] Uploads: MIME allowlist, size cap, content check where it matters

## Authentication and authorization
- [ ] Every protected endpoint checks authorization for the specific resource
- [ ] Passwords hashed with argon2, scrypt, or bcrypt
- [ ] Session cookies are httpOnly, secure, sameSite; bounded lifetime
- [ ] Auth endpoints rate limited, with a shared store when more than one instance runs

## Secrets and data
- [ ] No secrets in source or git history; `.env*` gitignored; `.env.example` has placeholders
- [ ] No secrets, tokens, or personal data in logs or telemetry
- [ ] Personal data classified, collected for a stated purpose, with retention and a deletion path
- [ ] Responses strip sensitive fields; errors are generic to users

## Network and configuration
- [ ] Security headers set (CSP from `default-src 'self'`, HSTS, nosniff, frame options)
- [ ] CORS limited to an explicit origin list; never `*` with credentials
- [ ] Server-side fetches of user URLs: scheme/host allowlist, all resolved IPs public, no redirects

## Dependencies
- [ ] Native audit run against the committed lockfile; critical/high triaged by reachability
- [ ] New dependencies reviewed (owner, release age, install scripts, typosquats)
- [ ] One lockfile per install boundary; installs reproducible

## LLM features (if any)
- [ ] Model output validated against a schema before use; never executed or rendered raw
- [ ] Secrets, other tenants' data, and the full system prompt kept out of the context
- [ ] Tool permissions scoped; tool arguments validated; destructive actions confirmed in code
- [ ] Token, rate, and recursion limits set
