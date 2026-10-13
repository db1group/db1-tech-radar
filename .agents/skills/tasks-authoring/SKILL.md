---
name: tasks-authoring
description: >
  Standard for authoring the tasks.md of a work unit in spec-driven
  development: hierarchical checklist, granularity, ordering by dependency
  graph, the predecessors each task declares, contents of a task and
  cross-domain dependencies. Use when generating or reviewing a tasks.md.
---

# Authoring tasks.md

Tasks are units of direction: they say **what**, not **how**. Whoever
implements discovers the "how" by loading the relevant skills during
execution. Do not prescribe implementation, do not repeat content from
`spec.md`/`plan.md` nor from the skills, and do not explicitly reference which
skills to load.

The `tasks.md` lives in the unit folder, `.agents/specs/<NNN>-<slug>/`, and is a
hierarchical checklist in the `- [ ]` format, consuming the `spec.md` and `plan.md`
already produced. Each item carries a stable id (`T<n>`), the predecessors it depends
on and the description of what it delivers.

## Granularity rules

Granularity has two sides: grouping artifacts that directly depend on one
another and splitting when a task has accumulated too much. The rules below
cover both sides.

- Each task delivers a cohesive and testable unit, implementable in a single
  premium agent session without blowing the context. As a practical anchor:
  typically 2–8 files touched (tests included), 1 user flow OR
  1 cohesive technical capability.
- Group by direct dependency: artifacts that do not exist in isolation
  make up the same task.
- The applicable tests (unit, integration, e2e, when applicable) go in the very task that creates
  the code, never in a later task.
- Order by the real dependency graph: an artifact created in a task is
  consumed immediately, by the same one or the next. If an artifact will only
  be used several tasks later, it is not born before — it is born together with the task
  that first uses it. The graph is not left implicit in the order of the file —
  each task declares its predecessors (see below).
- Do not create purely structural tasks (creating folders, declaring empty types,
  installing dependencies in isolation). Installing a dependency is part of the task
  that first uses it.
- Tasks cover the delta between the current code and the target state of this unit.
  Refactoring, rewriting, migration or correction of what already exists are
  legitimate deltas: the task acts on the current code (what to preserve, what to
  change), instead of recreating it from scratch. What is avoided is reimplementing
  what already exists and meets the goal when transforming it is not the objective
  of this unit.
- When a cross-cutting base does not yet exist in the project (test runner,
  logging library, standardized HTTP client) and the `plan.md` indicates that this unit
  needs to introduce it, the setup does not become a separate task, but MUST appear as
  a named and explicit step in the description of the first task that uses it, marked
  as a prerequisite — so it does not become invisible during execution. This includes any
  technical dependency declared in the domain's
  `.agents/skills/<domain-slug>/references/technical-dependencies.md` (see the `spec-
  authoring` skill) that `plan.md` decided to build in this unit — not only what `plan.md`
  names on its own.

Signs that a task has accumulated too much and needs to be split:

- **Multiple independent user flows in the same task.** Listing
  (read), creation form (write) and editing (write) are different
  flows, are usually delivered by different developers/PRs, and
  each carries its own tests. In frontend, this usually becomes
  one task per screen/route; in backend, one task per cohesive set of
  endpoints with related logic.
- **More than 3 distinct user actions in a task.** E.g.: "filter +
  new version + retranslate + deactivate" are 4 actions of a different nature.
  Split by action or by coherent group.
- **The description needs more than one paragraph for the main "what".**
  If you are listing 5–10 bullets of distinct behaviors in a task,
  each bullet is a candidate to become its own task.
- **Technical layers mixed with behavior.** Service + types + utils
  + first screen in the same task: the layers are coupled out of laziness,
  not out of real dependency. Start from the simplest end-to-end
  behavior; the service, the types and the utils are born inside it.

## Dependencies between tasks

The position in the checklist does not say which task blocks which, and whoever
executes picks a subset of them. Every task therefore declares its predecessors on
its FIRST child line:

```markdown
- [ ] **T5. Outbox publisher for events**
  - Depends on: T3
```

- The line appears on EVERY task; one that depends on nothing declares `none`. An
  absent line reads as a forgotten record, not as an independent task.
- It lists ONLY ids from this same `tasks.md`, separated by commas, and only DIRECT
  predecessors — if T3 depends on T2 and T2 on T1, T3 lists `T2` alone. What blocks
  from outside the unit is a precondition (see "Boundary in the tasks"), and the two
  lines coexist on the same task.
- The dependency is real when the task cannot be completed before the other: it
  consumes, extends or replaces an artifact the other creates. Coming later in the
  file is not, by itself, a dependency — the expected shape is a graph, where
  independent tasks share a predecessor, not a straight `T1 ← T2 ← T3` chain.
- Every id points BACKWARD, to a task earlier in the file: the file order is a
  topological ordering of an acyclic graph. Needing to point forward means the
  decomposition or the ordering is wrong.
- The label follows the language of the artifact; the ids are not translated.

## Forward-dependencies between tasks

The default is for the infra to be born together with the first task that uses it. When,
exceptionally, a consumer needs to come before the task that delivers the definitive
infra, the source task creates a temporary construct
(placeholder, embedded constant, stub) and a later task replaces it. This
pair is a forward-dependency and requires two records, so the debt is not
lost between the tasks:

- The description of the **destination task** explicitly names the replacement. Without this, the cleanup becomes semantic
  wishful thinking and does not happen. The destination also lists the source among its
  predecessors, since it replaces a construct that the source creates.
- The unit gains a `forward-deps.md` with an entry in status `planned`
  linking source and destination:

```markdown
# Forward-dependencies — 012-reporting

## FD-1 — temporary stub of the configuration provider
- source: T2
- destination: T5
- status: planned
- constructs: `ConfigProviderStub`, `DEFAULT_LIMITS`
- expected resolution: replace with the definitive configuration provider delivered in T5.
```

If no later task replaces the construct, it should not exist:
prefer reordering so the infra comes before the consumer. A forward-dependency without
a clear destination is a sign of wrong decomposition, not of legitimate debt.

## Anti-patterns

Do not apply a fixed CRUD template ("technical base → catalog → creation →
editing → validation"). Derive the sequence of tasks from the real dependency
graph of **this** spec; different domains result in different
decompositions — that is expected. In particular:

- **Do not start the `tasks.md` with a task for a "domain technical base",
  "service with all the endpoints", "shared types" or "domain
  utilities".** This pattern circumvents the purely-structural-task rule:
  it packages types + service + utils without observable behavior,
  anticipating artifacts that would only be consumed several tasks later. Each
  endpoint, type or utility is born in the task that **first uses it**. When
  the second task needs the same resource, it is refined or refactored
  from what already exists.
- **Do not create a final task of the "integrated validation" / "run the
  test cases" / "validate complete flows" kind.** The manual validation of the
  `test-cases.md` is the responsibility of another step, outside this checklist. Each
  task that delivers behavior already carries its own tests; the `tasks.md` ends
  when the last behavior has been delivered. When E2E testing is part of the
  request, the E2E tests belong INSIDE the implementation task that delivers each
  behavior — derived from the `test-cases.md` catalog —, just like the unit and
  integration tests; do NOT split them into their own task. A dedicated,
  standalone E2E task exists ONLY when the user explicitly asks for one. What is
  always forbidden is a single catch-all "run the validation" task at the end.
- **Do not repeat "introduce test infrastructure" across several specs of
  the same project.** This setup is born in the first spec that needs it, as
  a named prerequisite of the first task; subsequent specs consume what already
  exists.

## Boundary in the tasks

The `tasks.md` only lists tasks executable WITHIN the current scope. Everything outside is
a reference, precondition or open question — never a task:

- Blocking dependency of another unit → record it as a **precondition** in the
  task description.
- Dependency that blocks the entire unit → record it as an **open
  question** (gap) instead of creating the task.
- Never generate a task that implements code belonging to another domain.
- A technology decision without a firm basis does not become a task. Installing or adopting a
  library, framework or dependency is only an executable step of a task when
  the choice is already settled on a concrete basis (in use in the code or stated without
  reservation by the user/source). If the source carries a reservation ("to be confirmed", "or
  similar", "suggested") or would be your own choice, that is an **open question** (gap)
  in the spec/plan phase — do not embed an installation step "to confirm
  later" in the implementation.

When this round asks for a skill maintenance task (creation, update
or correction), treat it as any other task in this checklist; the round
instruction defines whether it exists, what type it is and what it must contain.

A task to update the authoritative documentation (local skill or external
source via MCP) appears when the round mandates it or when the `plan.md`
recorded deliberate drift in the "Impact on the authoritative documentation" section. The target
of that task is always the authoritative doc — never the `spec.md` (the spec is corrected in
its own generation sub-phase, not by a task here). Without that record, do not
invent the task. Divergence between the doc and the code (or the spec) without a recorded
decision that resolves it is an open question (gap), not a task — and does not become a warning.

When it exists, the task to update/correct the authoritative documentation is the
FIRST task in the checklist, before the implementation tasks: the implementation
step reads the doc during execution, so the corrected doc precedes the tasks
that consume it.

## Cross-domain dependencies in the tasks

Behaviors that belong to other domains never become tasks here. They enter in
two sections of other artifacts:

1. **`spec.md` → "Cross-domain dependencies"** — the domain name, what it
   consumes or produces and, if relevant, its state ("still no spec", "spec
   approved in `015-projects/`", "implemented in production").
2. **`plan.md` → "External contracts"** — when the dependency requires a formal
   technical contract, it points to the file in `contracts/` of the owning spec.

If a task of **this** spec depends on something that **another** spec delivers first
(real blocking), record it as a **precondition** in the task description, not as an
independent task:

```markdown
- [ ] **T4. REST endpoints and contracts**
  - Depends on: T3
  - Precondition: the JWT authentication middleware needs to be available.
    In a new project, it comes from the `001-auth` spec (already approved); in maintenance, it already
    exists in production.
  - Controller exposing `POST /cost-centers`, `GET /cost-centers`, ...
```

If the dependency **blocks the entire spec** (e.g.: the other spec has not even been generated
and is a prerequisite), escalate as a gap in the first prompt instead of proceeding.

## Examples: the decomposition emerges from the domain

The shape of a `tasks.md` changes with the domain. The examples below show
different cuts — by layer (when there is a direct dependency between the
layers), by capability (when the domain is a collection of channels or
independent sub-behaviors), by route/screen (frontend CRUD) and by
section/widget (interface composed of independent parts). In all of them:
no "technical base" task at the start, no "integrated validation" task at the
end, tests in the very task that creates the code, every task declaring its
predecessors.

(The examples do not include a skill maintenance task; when the round
asks for one, it enters as the first task in the checklist, before the
implementation tasks.)

### Backend, by layer — when a layer does not exist without the previous one

Fictional domain **Cost Centers**: CRUD with hierarchy and events. The
tasks follow the dependency graph of the layers — the repository only makes
sense with the schema, the use cases only make sense with the repository,
the endpoints only make sense with the use cases. This cut by layer is NOT
the "anticipated technical base" anti-pattern: each task delivers observable
and testable behavior, and each created artifact is consumed immediately.

```markdown
# Tasks: Cost Centers

- [ ] **T1. Initial migration and data model**
  - Depends on: none
  - Migration creating `cost_centers` and `cost_center_history` per
    `data-model.md`, with constraints (unique code, self-reference FK,
    `valid_until > valid_from`) and indexes.
  - Migration tests (apply and rollback against a test database).

- [ ] **T2. Repository and business validators**
  - Depends on: T1
  - Repository with CRUD, flat listing and tree listing via a recursive
    CTE.
  - Validators: unique code (database + application), acyclic hierarchy,
    consistent validity period.
  - Unit tests covering each validator and each repository operation.

- [ ] **T3. Registration, editing and deactivation use cases**
  - Depends on: T2
  - `createCostCenter`, `updateCostCenter`, `deactivateCostCenter` — each one
    persisting the change, recording an entry in `cost_center_history` and
    emitting the corresponding event via the outbox.
  - Unit tests per use case covering happy paths and validated failures
    (duplicate code, cycle, already inactive).

- [ ] **T4. REST endpoints and contracts**
  - Depends on: T3
  - Controller exposing `POST /cost-centers`, `GET /cost-centers`,
    `GET /cost-centers?view=tree`, `POST /cost-centers/{id}/deactivate`,
    `GET /cost-centers/{id}/history` per
    `contracts/cost-centers.openapi.yaml`.
  - Error handling (`409`, `422`) with messages per the spec.
  - End-to-end integration tests covering the test cases in `test-cases.md`.

- [ ] **T5. Outbox publisher for events**
  - Depends on: T3
  - Worker that reads the `outbox` table and publishes `cost-center.*` events on the
    bus per `AGENTS.md`.
  - At-least-once guarantee with idempotency based on `event_id`.
  - Integration tests against the local bus.
```

### Backend, by capability — when the domain is a collection of adapters

Fictional domain **Notifications**: a dispatcher that sends notifications through
multiple channels (email, push, SMS). The channels are independent of
each other — there is no "schema → repo → use cases" graph. The natural cut is by channel
end to end. The first task delivers 1 channel working completely; the
following ones add the rest on top of the abstraction that emerged in T1 (not
on top of a "technical base" created before).

```markdown
# Tasks: Notifications

- [ ] **T1. End-to-end email sending**
  - Depends on: none
  - `dispatchNotification` use case reduced to the email case, with
    an `EmailChannel` adapter integrated with the SMTP provider described in
    `plan.md`.
  - Endpoint `POST /notifications` accepting `channel: "email"` and
    the minimal payload defined in `contracts/notifications.openapi.yaml`.
  - Unit tests of the adapter, the use case and integration tests of the endpoint
    covering successful delivery, invalid payload and provider failure.

- [ ] **T2. Push channel (FCM) over the existing dispatcher**
  - Depends on: T1
  - `PushChannel` adapter implementing the same interface used by
    `EmailChannel`; the dispatcher starts routing by `channel`.
  - Adapter tests (including exponential retry per `plan.md`) and
    integration tests of the endpoint for `channel: "push"`.

- [ ] **T3. SMS channel and configurable fallback**
  - Depends on: T2
  - `SmsChannel` adapter and fallback rule "if push fails, try SMS"
    when the recipient has both channels enabled.
  - Unit tests of the fallback rule and integration tests covering the
    end-to-end scenario with a simulated push failure.
```

### Frontend, by route/screen — classic CRUD

Fictional domain **Tech Leads**: registration, listing and editing. The
natural decomposition is by route/screen — each task delivers 1 complete
user flow. The domain service and types are born inside the
first task that uses them and grow in the following ones; there is no T1 for a "service
with all the endpoints" before any flow.

```markdown
# Tasks: Tech Leads

- [ ] **T1. Tech leads listing with local search and deletion**
  - Depends on: none
  - Route `/tech-lead` registered in the router with lazy loading and the
    catalog screen.
  - Initial fetch via `GET /leads`; the domain service HTTP client
    is born here, exposing only what this task consumes (`list`, `delete`).
  - Local text search over the loaded set and a deletion action
    with named confirmation and consistent reload.
  - Component tests of the screen covering initial fetch, search,
    clearing and deletion; unit tests of the service for `list` and `delete`.

- [ ] **T2. Creating a tech lead from an available user**
  - Depends on: T1
  - Route `/tech-lead/create` and the form screen in creation mode.
  - Extend the domain service with `getAvailableUsers`, `listProjects`
    and `create`; the shared types (`Lead`, `LeadPayload`) are born here.
  - Functional validations: available user required, `inTraining`
    defaulting to `false`, `leadProjects` omitted when empty; handling
    of `409` as duplication.
  - Component tests of the screen and unit tests of the service and the payload
    builder.

- [ ] **T3. Editing a tech lead with an immutable identity**
  - Depends on: T2
  - Route `/tech-lead/edit/:id` reusing the form base from T2
    in edit mode.
  - Extend the service with `getById` and `update`; keep `name`, `email` and
    `authProviderId` read-only in the screen.
  - Component tests covering hydration, locking of the identity
    fields and submitting the update; unit tests of the service for
    `getById` and `update`.
```

### Frontend, by section/widget — interface composed of independent parts

Fictional domain **Project Dashboard**: a single route that gathers several
read-only widgets, each with its own data source, its own
loading/error states and its own behavior. It is not CRUD — there is no listing,
creation or editing as flows. The natural cut is by widget, with the host
screen being born inside the first task as a mere container.

```markdown
# Tasks: Project Dashboard

- [ ] **T1. Host route and header with global project metrics**
  - Depends on: none
  - Route `/projects/:projectId/dashboard` registered with lazy
    loading and the host screen empty, except for the header.
  - Header widget consuming `GET /projects/:id/summary` and
    displaying name, status and three KPIs (health score, active project since,
    next assessment).
  - Component tests covering fetch, rendering of the KPIs, loading
    and error states.

- [ ] **T2. Health score time-series chart widget**
  - Depends on: T1
  - `HealthHistoryChart` component consuming
    `GET /projects/:id/health-history?months=12`, with a window selection
    (3/6/12 months) controlled locally.
  - Loading, empty (no history yet) and error states of the
    widget itself; fitting into the host screen created in T1.
  - Component tests covering window switching, empty and error.

- [ ] **T3. Recent activity widget with infinite pagination**
  - Depends on: T1
  - `ActivityFeed` component consuming `GET /projects/:id/activity`
    with a cursor, scroll expansion and its own empty state.
  - Fitting into the host screen; no changes to the header or the chart.
  - Component tests covering loading of the first page,
    pagination, empty and error.
```
