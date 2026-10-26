<!--
Template of a BACKEND test-cases.md.
Copy the structure to `.agents/specs/<NNN>-<slug>/test-cases.md`, remove these
comments and replace the `<...>` placeholders. Group by user story, one
`### TC-<n>` per test case with its classification (mandatory/recommended), and
close every case with `**Expected:**`. Everything a case cites must already be
declared in the spec.md/plan.md — do not invent behavior, data, routes or
messages here. Do not assume a specific tool for issuing requests or inspecting
state (HTTP client, DB console, queue console); name one only when it is the
project convention. The content language follows the project's artifact
convention.
-->
# Test cases: <unit name>

## Preconditions

- <Services running (API, database, workers), migrations applied.>
- <Seed data and test users per profile.>
- <Secrets/tokens exported, e.g. an admin token in `$ADMIN_TOKEN`.>

## Story 1 — <user story title from spec.md>

### TC-1 (mandatory) — <success via endpoint>

1. Call `POST /<resource>` with `<payload>`.

**Expected:** `<status>` with `<response body/fields>`, as declared in the spec.

### TC-2 (mandatory) — <persisted state, verified in the database>

1. <Trigger the operation (e.g. the call from TC-1).>
2. Read the `<table>` record for `<key>` directly in the database.

**Expected:** the row exists with `<column> = <value>`, matching `data-model.md`.

### TC-3 (mandatory) — <asynchronous side effect, verified in the queue>

1. <Trigger the operation that should publish/enqueue.>
2. Inspect the `<queue/topic>`.

**Expected:** exactly one `<message/event>` is enqueued with `<payload fields>`.

### TC-4 (recommended) — <cache side effect>

1. <Trigger the read that should populate the cache, or the write that should
   invalidate it.>
2. Inspect the `<cache key>`.

**Expected:** the cache holds `<value>` (or is invalidated), per `plan.md`.

### TC-5 (mandatory) — <exception / validation failure>

1. Call `POST /<resource>` with `<invalid payload>`.

**Expected:** `<error status>` with the message "<message declared in the spec>";
no record is persisted and no message is enqueued.
