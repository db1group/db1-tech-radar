---
name: test-cases-authoring
description: >
  Standard for authoring the test-cases.md of a work unit: the catalog of test
  cases (success and exception) grouped by user story, each with a stable id and
  a classification, doubling as the end-to-end manual validation runbook and the
  source for automated E2E tests. Use ONLY when explicitly producing or
  reviewing test-cases.md in its own dedicated sub-phase — never as part of
  authoring the spec.md or the plan.md.
---

# Authoring test-cases.md

The `test-cases.md` is the **catalog of test cases** of the work unit: every
success and exception path of the affected flows, grouped by user story. It
lives in the unit folder `.agents/specs/<NNN>-<slug>/`, alongside `spec.md`,
`plan.md` and `tasks.md`, and serves three purposes:

1. **End-to-end manual validation runbook** — a person runs it in a real
   environment at the implementation checkpoint, where automation is weak (real
   SSO, expiring token, browser, external integrations).
2. **Source for automated E2E tests** — when E2E testing is part of the
   request, each test case is the direct source for an automated E2E test
   (Playwright, Cypress or equivalent), written inside the implementation task
   that delivers the behavior.
3. **Coverage reference at the implementation checkpoint** — the id lets the
   implementation step point out which test cases a task impacts.

It is generated in its own sub-phase, AFTER `spec.md` and `plan.md` and BEFORE
`tasks.md`, in the same session — it consumes both already-produced artifacts.

## Not a source of truth

The `test-cases.md` is a **derived catalog**, not a source of truth: it does not
introduce behavior, data, routes, interface messages or any new detail.
Everything a test case cites must already be declared somewhere in the `spec.md`
or the `plan.md`. If covering a flow would require a fact that is not declared in
either (a missing behavior, status, message or route), that is a divergence
between authoritative artifacts — escalate it as a gap before closing the round;
do NOT invent the missing detail here.

## Coverage: every test case, grouped by user story

Cover, for EACH user story of the `spec.md`, every test case of the affected
flows — both the success paths and the exceptions (access denied, expiration,
validation errors, conflicts, idempotency, and any failure the spec/plan
describe). Do not stop at the happy path.

- **Group by user story.** Use one section per user story (cite the story
  number/title from `spec.md`) and list its test cases under it. A test case
  that exercises more than one story is grouped under the primary one and
  cross-references the others.
- **Be exhaustive over the delta.** Every acceptance criterion and every
  declared exception of the affected flows maps to at least one test case. What
  stays unchanged (outside the unit delta) is not re-covered.
- **Borderline case.** In a trivial implementation bug fix without a change in
  observable behavior, a single short test case (the repro that becomes covered
  from this fix onward) is enough.

## Stable id and classification

Each test case has a **stable id** `TC-<n>` assigned at authoring time, in the
heading, independent of ordering (like the `T<n>` of the tasks). The id is what
the implementation step uses to reference which test cases a task impacts and
what an automated E2E test maps back to, so it must NOT be reused or renumbered
when test cases are inserted or reordered — append new ones with the next free
number.

Each test case is also **classified** by how essential it is to the unit:

- **Mandatory (critical)** — a core path or a critical failure that must pass
  for the unit to be considered working. If it fails, the delivery is not
  acceptable.
- **Recommended (relevant)** — a relevant but non-blocking case (secondary edge,
  cosmetic message, low-frequency variation) worth validating when there is time
  or automation.

Record the classification in the heading, right after the id.

## Content of each test case

- **Preconditions** — infra, accounts, data and variables needed to run
  (services running, test users per profile, env vars). Declare them once at the
  top of the file and/or per test case when they differ.
- **Numbered steps** — an unambiguous, executable sequence. Describe steps in
  terms of what the tester does and observes, not implementation details. Do not
  assume a specific tool (HTTP client, browser automation, DB console); name one
  only when it is already the project convention.
- `**Expected**` — the end-to-end verifiable result. Mandatory closing line of
  every test case.

**Start from a known entry point and describe the full path.** Every test case
begins at an explicit entry point — a route/URL, or the app's home — and lists
the steps the user walks to reach the action under test. Never start mid-screen
assuming a panel, modal, drawer, tab or list row is already open: in the
frontend, spell out the navigation (open the route, locate the specific row/item,
click the control that opens the panel/dialog, select the tab) BEFORE the step
that exercises the behavior. A case that starts "in the history panel" without
saying how the user got there is not reproducible and cannot become an E2E test.
When several cases share the same path, still restate it in each one (or factor
the shared prefix into the preconditions) — a case is read and run on its own.

A test case is not only a direct call to an endpoint or a screen action: it may
assert an observable side effect — a row persisted in the database, a message
enqueued in a queue/topic, a value written to or invalidated in the cache, a
file produced. Cover the side effects the spec/plan declare, not just the
immediate response.

Write each test case self-contained and deterministic (explicit preconditions,
unambiguous steps from the entry point, verifiable expected result) so it maps
1:1 to an automated E2E test.

## Templates

Two commented skeletons serve as a starting point — one per stack. Copy the one
that fits the unit and adapt it; they are neither mandatory nor exhaustive. Both
group by user story, use stable `TC-<n>` ids with a classification and close every
case with `**Expected:**`.

- Backend test cases: `assets/backend-test-cases-template.md` — endpoint calls
  and non-endpoint assertions (database, queue, cache).
- Frontend test cases: `assets/frontend-test-cases-template.md` — user
  interactions with the interface, web (browser) or mobile (Android/iOS).
