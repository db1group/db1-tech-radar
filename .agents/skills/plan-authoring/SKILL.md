---
name: plan-authoring
description: >
  Standard for authoring the plan.md and the auxiliary technical artifacts
  (data-model.md, research.md, contracts/*, ui/*) in
  spec-driven development. Use when generating or reviewing the technical view of a
  work unit.
---

# Authoring plan.md

The `plan.md` answers **how**, in a general technical view. It references technical
decisions, not business rules (those live in the `spec.md` and in the domain source
documentation). It lives in the same unit folder,
`.agents/specs/<NNN>-<slug>/`. When a section grows, migrate the content to
an auxiliary artifact and link from here.

## Current code state

Start from what the repository already has. Stack, structure and technical decisions
reuse what is already implemented, except when the target itself is
to transform it (refactoring, rewriting, migration); the plan traces the path from the
current state to the target, not from a zero point. Acknowledge modules, patterns and
infrastructure already present before proposing new ones.

## Technical dependencies declared by the domain

When `spec.md` included, in "what this spec implements", a technical dependency from the
domain's `.agents/skills/<domain-slug>/references/technical-dependencies.md` (as cross-
cutting infrastructure this unit creates), detail HOW it is set up here, under "Technical
decisions" — same as any other technical decision. The decision (build it now vs. leave it
explicitly pending for a future unit) is made here, in `plan.md` — never deferred to
`tasks.md`, which only turns an already-made decision into the named prerequisite step of
the first task that needs it.

## Each fact has one owner

Where an auxiliary artifact exists, the content lives there and the `plan.md` carries the
**verdict**: the decision in one line, so the reader knows WHAT was decided without opening
the file, plus the relative link to it. This holds for the canonical artifacts
(`data-model.md`, `research.md`, `contracts/*`, `ui/*`) and for any additional file of the unit
folder, including one outside the consolidated vocabulary (`migration-plan.md`, `rollback.md`).

What belongs to the auxiliary artifact alone: considered alternatives, tradeoffs, rationale, the
evidence that settles the decision, tables, schemas and examples. Reproducing any of it in the
`plan.md` creates a second copy that drifts from the first one.

Without an auxiliary artifact, the content stays whole in `plan.md` — the rule is against
duplicating it, not against detailing it.

## Every decision in the plan is a settled decision

A choice recorded with a conditional escape ("stays as an alternative if X", "to be confirmed
during implementation", "if it does not work, fall back to Y") is not a decision: it is an open
question dressed as one. The plan carries a single path, and the execution follows it without
reopening it.

Two things settle a choice:

- **Evidence you obtain yourself** — read the code the change touches, following the usage flow;
  read the real implementation of an installed dependency (the file under `node_modules`) instead
  of assuming its behavior from memory or from its documentation; run a test or a script the
  project already has that exercises the point in doubt. Obtain the evidence before deciding, and
  record it in `research.md`.
- **A firm basis already recorded** — for a choice of technology, library, framework, dependency
  or relevant technical pattern: it is already in use in the code, or it was stated WITHOUT
  RESERVATION by the user or by the source artifacts (`functional-map.md`,
  `discovery-answers.md`, the unit description, `AGENTS.md`). A source carrying a reservation
  ("to be confirmed", "or similar", "suggested", "likely"), or a choice that would be yours
  without backing, is not a basis.

When what is missing is evidence that only new code would produce — a POC, a spike, a throwaway
probe —, do not write that code: record the choice as an open question for the human, naming the
experiment (what to run) and what each result decides.

Before delivering, reread the artifacts hunting for exactly this: an unverified hypothesis holding
up a choice, an alternative kept in reserve, a verification postponed to the implementation. Each
one is either closed with evidence or escalated as an open question.

## Expected sections

- **Stack and structure** — aligned with the project conventions (`AGENTS.md`), without
  repeating them.
- **Technical decisions** — one line per decision, carrying the verdict; alternatives,
  tradeoffs and evidence in `research.md`.
- **Data model** — the verdict in one line; entities, columns, constraints and indexes in
  `data-model.md`.
- **External contracts** — which contracts exist and where; the specification in `contracts/*`.
- **Interface** — which screens and flows the unit touches; the description in `ui/*`.
- **Testing strategy** — which levels (unit, integration, e2e) fit in
  which tasks; and which test infrastructure already exists versus what needs
  to be introduced by this unit (runner, libs). This is a technical
  prerequisite, not a business rule — it lives here, never in a user story.
- **Impact on the authoritative documentation** — which source documentation is
  affected and becomes a task in `tasks.md`. The authoritative documentation can be a
  local skill (`.agents/skills/<slug>/`) or an external source accessed via MCP
  (Confluence, Azure DevOps, etc.). Record here ONLY the **deliberate drift**: the
  unit changes the behavior on purpose and there is a recorded decision that backs it
  (unit description, `discovery-answers.md`, `AGENTS.md`, or an already-resolved gap).
  Say what diverges and why — it is this record that generates the task that updates the
  **doc** (the target is always the authoritative doc, never the `spec.md`). Without deliberate
  drift, declare "no impact" and no doc task appears. A divergence
  between the doc and the code (or the spec) without a recorded decision that resolves it does NOT enter
  here as if it were decided nor does it become a warning: it is an open question (gap), escalated
  to the human — even when it seems obvious which side is right, and including when
  the doc itself seems to be the wrong part.

Each section also states the verdict on its auxiliary artifact: generated and linked, or waived
with the one-line reason ("no data model — the unit touches no persistence").

## Optionals with consolidated vocabulary

They live in the unit folder. Use these names when the content applies:

- `data-model.md` — entities, attributes, relations, indexes, constraints,
  ENUMs. In frontend, consumed stores/state shapes.
- `research.md` — for each non-trivial decision: context, alternatives,
  decision, rationale, the evidence that settles it and consequences.

Decide explicitly, for EACH canonical optional — `data-model.md`, `research.md`, `contracts/`,
`ui/` —, whether you generate or waive it, instead of generating only the ones you remember. The
criterion is single: generate it if it helps avoid ambiguity in executing the tasks; content that
fits in a short section of `plan.md` does not become a separate file. `research.md` has no section
of its own — its verdict goes under "Technical decisions".

## Open folders

The file names are your decision, reflecting the content:

- `contracts/` — formal contracts. The extension reflects the technology:
  `*.openapi.yaml` (REST), `*.graphql`, `*.proto` (gRPC),
  `*.asyncapi.yaml` (events), `*.md` (protocols without a formal standard).
- `ui/` — interface description. The decomposition varies according to the nature
  (mobile, web admin, dashboard, public site). Examples: `screens.md`,
  `forms.md`, `flows.md`, `accessibility.md`, `states.md`.

## External dependencies

When a dependency requires a formal technical contract, point to the file in
`contracts/`. Do not detail the implementation of another domain here.

## Complete plan.md example

The example uses the fictional domain **Cost Centers** (whole domain, pure
backend), the same as the spec.

```markdown
# Plan: Cost Centers

## Stack and structure

Node/TypeScript backend in a hexagonal architecture per `AGENTS.md`. The
`cost-centers` module lives in `src/modules/cost-centers/` following the project
organization pattern.

## Technical decisions

One line per verdict; context, alternatives and evidence in
[`research.md`](./research.md).

- **Hierarchy**: adjacency list (`parent_id`), read through a recursive CTE.
- **Deactivation**: `status` enum (`active`/`inactive`) with a record in
  `cost_center_history`; there is no physical deletion.
- **Cycle validation**: in the application, during a parent change, over the current tree.
- **Event emission**: synchronous, inside the persistence transaction, via the outbox pattern.
- **Input validation**: the schema library already adopted in the project.

## Data model

Tables `cost_centers` and `cost_center_history`, with the hierarchy on
`cost_centers.parent_id`. Details in [`data-model.md`](./data-model.md).

## External contracts

REST API in
[`contracts/cost-centers.openapi.yaml`](./contracts/cost-centers.openapi.yaml).
Events `cost-center.created`, `cost-center.updated` and `cost-center.deactivated`,
with the payload format in
[`contracts/cost-center-events.md`](./contracts/cost-center-events.md).

## Interface

Not applicable to this spec — purely backend domain. The CRUD will be consumed by
the administrative interface of the `admin-ui` domain (separate spec), which waives
`ui/` here.

## Testing strategy

- **Unit** — validators (unique code, cycle, validity period) and use cases
  (registration, editing, deactivation, tree listing). Each task that delivers
  testable code includes the tests in the task itself.
- **Integration** — REST endpoints against a real database (sandbox), covering the
  acceptance criteria of the affected flows.
- **E2E** — out of scope for this spec; depends on UI.

## Impact on the authoritative documentation

No impact. In the whole-domain scenario, the
`cost-centers` skill already reflects the expected behavior and the implementation does
what is written. A doc task would only appear with deliberate drift recorded here —
which was not the case. (If the skill diverged from the code without a decision that resolved it, that
would be a gap, not this section.)
```

## data-model.md example

Entities, attributes, relations, indexes, constraints, ENUMs. In frontend,
it describes consumed stores/state shapes.

```markdown
# Data model: Cost Centers

## Entities

### `cost_centers`

| Column            | Type         | Null | Notes                            |
|-------------------|--------------|------|----------------------------------|
| `id`              | uuid         | no   | PK, generated by the application |
| `code`            | varchar(20)  | no   | globally unique                  |
| `name`            | varchar(100) | no   |                                  |
| `accounting_code` | varchar(30)  | no   | indexed, external ERP key        |
| `parent_id`       | uuid         | yes  | FK → `cost_centers.id`           |
| `status`          | enum         | no   | `active` \| `inactive`           |
| `valid_from`      | date         | no   |                                  |
| `valid_until`     | date         | yes  | must be > `valid_from`           |

### `cost_center_history`

| Column           | Type        | Null | Notes                                    |
|------------------|-------------|------|------------------------------------------|
| `id`             | uuid        | no   | PK                                       |
| `cost_center_id` | uuid        | no   | FK → `cost_centers.id`                   |
| `event`          | enum        | no   | `created` \| `updated` \| `deactivated` |
| `payload`        | jsonb       | no   | snapshot of the changed fields           |
| `actor_id`       | uuid        | no   | FK → `users.id`                          |
| `occurred_at`    | timestamptz | no   | default `now()`                          |

## Constraints

- `UNIQUE (cost_centers.code)` — globally unique code.
- `CHECK (valid_until IS NULL OR valid_until > valid_from)`.
- Absence of a cycle in the `parent_id` graph — validated in the application.

## Indexes

- `cost_centers (parent_id)` — for hierarchical listing.
- `cost_centers (status, code)` — for filters + text search.
- `cost_center_history (cost_center_id, occurred_at DESC)` — for history.
```

## research.md example

For each non-trivial technical decision: context, considered alternatives, the decision
made, rationale, the evidence that settles it and the consequences. The evidence is
concrete — the file and excerpt read, the command run and its result, or the recorded
source that states the choice without reservation. A decision the available evidence does
not settle does not enter here: it is escalated as an open question to the human.

```markdown
# Research: Cost Centers

## Input validation library

**Context.** The inputs need to be validated by a declarative schema,
reusable between the API and the application layer.

**Alternatives:**

- **Dedicated schema library** — declarative schemas with type
  inference; adds a dependency.
- **Manual validation** — no new dependency; verbose and prone to drift.

**Decision:** the dedicated schema library already adopted in the project.

**Evidence:** already a direct dependency in `package.json` and in use in
`src/modules/invoices/invoice.schema.ts`. Firm basis, settled decision.

**Consequences:** the schemas follow the already existing pattern; no new
dependency is introduced.

## Reading the hierarchy

**Context.** The tree listing traverses an arbitrary depth of `parent_id` and is the
hottest read of the domain.

**Alternatives:**

- **Recursive CTE** — a single round trip; depends on the driver emitting
  `WITH RECURSIVE`.
- **One query per level** — portable; N round trips per listing.

**Decision:** recursive CTE.

**Evidence:** the installed driver emits the clause —
`node_modules/<driver>/lib/query/builder.js` assembles `WITH RECURSIVE` from
`withRecursive()`; `yarn test src/modules/org-units` passes over the equivalent
listing already in production in `org-units`.

**Consequences:** the listing stays in a single query; a driver swap reopens this
decision.
```

## Contract example (contracts/cost-centers.openapi.yaml)

Formal contracts live in `contracts/`, with the extension reflecting the technology.
OpenAPI snippet for REST:

```yaml
openapi: 3.0.3
info:
  title: Cost Centers API
  version: 1.0.0
paths:
  /cost-centers:
    post:
      summary: Registers a new cost center
      responses:
        "201": { description: Created }
        "409": { description: Code already registered }
        "422": { description: Validation failed }
components:
  schemas:
    CostCenterCreate:
      type: object
      required: [code, name, accounting_code, valid_from]
      properties:
        code:            { type: string, maxLength: 20 }
        name:            { type: string, maxLength: 100 }
        accounting_code: { type: string, maxLength: 30 }
        parent_id:       { type: string, format: uuid }
        valid_from:      { type: string, format: date }
```
