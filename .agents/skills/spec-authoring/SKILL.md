---
name: spec-authoring
description: >
  Standard for authoring the spec.md of a work unit in spec-driven
  development: structure and location of the spec, sections, user stories,
  acceptance criteria, scope boundary and dependencies. Use when generating
  or reviewing a spec.md.
---

# Authoring spec.md

The `spec.md` answers **what** and **why** of a work unit — never the
**how** (that belongs to `plan.md`). It is the source of truth for scope and
expected behavior; it references the domain source documentation without
transcribing it.

## Reference the authoritative documentation, do not transcribe it

When the domain already has authoritative documentation, it is the **single** authoritative source of behavior. It can
be a local skill (`.agents/skills/<slug>/`) or an external source accessed
via MCP (Confluence, Azure DevOps, etc.). Other artifacts you consult
(`functional-map.md`, `discovery-answers.md`, the legacy profile) are supporting context:
never label them as "authoritative" nor treat them with the same weight as the doc. This
precedence decides WHERE you derive the behavior from (from the doc, not from the supporting
artifacts); it does NOT authorize you to resolve on your own a factual divergence between the doc
and the code (or between the doc and a requirement of this unit) — that is handled in
"Divergence from authoritative documentation", below.
Scope and Boundary are short lists of capabilities — one line per
capability —, not a rewrite of the rules that already live in the doc: cite and link the
doc or the section instead of copying tables, flows and precedences. Exception: the
acceptance criteria must be concrete and testable (values, routes, statuses,
formats), even when they derive from the doc.

## Divergence from authoritative documentation

Authoritative documentation, existing code and the requirement of this unit may not
match each other. What decides the treatment is NOT your confidence about which side
"should" win — it is whether there is a **recorded decision** that establishes the
intended behavior. Three cases:

1. **No divergence** — the artifacts agree. Derive the acceptance criteria from the
   doc, nothing more.
2. **Deliberate drift (there is a recorded decision)** — this unit changes the behavior
   on purpose and there is a decision that backs it (the unit description,
   `discovery-answers.md`, `AGENTS.md`, or a gap already resolved in this round). The
   acceptance criteria describe the target behavior and the drift is recorded in
   `plan.md` ("Impact on the authoritative documentation"), from which the task is born that
   updates the **doc** (never the `spec.md`) in the tasks phase.
3. **Divergence without a recorded decision** — two authoritative artifacts
   contradict each other (doc × code, doc × requirement, spec × doc) and nothing recorded says which
   reflects the intent. This is an open question, always — no matter how
   obvious which side is right may seem. You do NOT elect the winner, do NOT label it as
   "cosmetic", do NOT proceed assuming the doc as truth and do NOT drop this into a warning:
   escalate as a gap and leave the decision to the human. This includes the case where the
   doc ITSELF appears to be the wrong side (e.g.: names/identifiers that do not match the
   consolidated and in-use code) — it is still a gap, and the human resolution may be
   to fix the doc.

Never produce a `spec.md` whose acceptance criteria contradict the doc with the
"fix" pushed to a task later. At the moment you write the criteria,
either they reflect the already-resolved behavior (cases 1 and 2), or the divergence is still
open and you escalate as a gap now, before closing the spec.

You do NOT edit the authoritative documentation in this step — you only write inside the unit
folder (`.agents/specs/<NNN>-<slug>/`). Even when a gap is resolved with "the doc is
wrong and must change", that becomes deliberate drift (the gap answer is the recorded
decision): the doc fix is recorded in `plan.md` and becomes a task, executed in the
implementation step — never a doc edit made now.

## Structure and location

Each work unit lives in a `.agents/specs/<NNN>-<slug>/` folder:

- `<NNN>` — sequential number, zero-padded (e.g.: `001`, `015`), in order of
  creation.
- `<slug>` — kebab-case that identifies the unit.

Core artifacts (always present): `spec.md`, `plan.md`, `tasks.md`.
Optional artifacts (when they help avoid ambiguity in execution):
`data-model.md`, `research.md`, `checklists/`, `contracts/`,
`ui/`. The technical optionals are detailed in the plan; here what matters is what
ties to the "what" (e.g.: `checklists/requirements.md`).

## Expected sections

- **Overview** — what this spec delivers, in one sentence.
- **Domain** — the domain slug and a relative link to the source documentation
  (e.g.: `.agents/skills/<slug>/SKILL.md`). In a cross-cutting change (multiple
  domains), this section becomes **Domains involved** — see "Cross-cutting spec
  (multiple domains)" below.
- **Scope** — **product** capabilities (user language): what the
  application does (In) and what it deliberately does not do (Out). Do not cite
  technical artifacts here.
- **Domain boundary** — **technical artifacts** (entities, endpoints,
  events, modules, contracts, cross-cutting infrastructure) that this unit
  implements vs. those that belong to other domains. See the rules below.
- **User stories** — format "as X, I want Y, so that Z".
- **Acceptance criteria** — Given/When/Then per story.
- **Current → new behavior** — only in a feature on an existing domain:
  explicit contrast between the current state and the new one. What stays the same
  goes here, outside the "what this spec implements" boundary.
- **Expected behavior** — only in a bug fix: the correct
  reference behavior (the skill) and the description of the observed deviation.
- **Cross-domain dependencies** — behaviors consumed from other domains
  or systems; they do not become tasks here.
- **Risks and observations**.

## Domain boundary (defense against leaked scope)

This section speaks of **technical artifacts**, not of capabilities. If the Boundary
paraphrases the Scope, it is wrong: list entities, endpoints, events,
modules, contracts and cross-cutting infrastructure — not features in
user language. Practical rule: each item starts with a technical
noun (`Entity X`, `Endpoint POST /y`, `Event z.created`, `Module W`),
not with a product-behavior verb.

Record two lists:

1. **What this spec implements** — technical artifacts that belong to the
   current domain/unit, plus the cross-cutting infrastructure that this unit
   creates by being the first to need it.
2. **What belongs to other domains** — artifacts of other units;
   they enter only as cross-domain dependencies, never as a task here.

Scope of the "what this spec implements" list: if the spec covers a whole new
capability (a whole domain), it covers everything born with it;
if it covers a change or fix over something existing (feature or bug), it covers
only the delta (what stays the same goes in "Current → new behavior").
The "what belongs to other domains" list has the same format across all
operations.

### Domain code vs cross-cutting infrastructure

It is cross-cutting infrastructure when ALL hold: (1) it does not encode business
rules of any domain; (2) multiple future domains will need it
with the same behavior; (3) the interface is generic, without mentioning concepts
of a domain. If one fails, it is domain code (of the owning domain). Rule of
thumb: if removing the mention of the domain the name still makes sense, it is probably
cross-cutting. The current unit may create the cross-cutting infrastructure when it is
the first to need it; what is never allowed is to implement domain
code of another module.

### Technical dependencies declared by the domain

When `.agents/skills/<domain-slug>/references/technical-dependencies.md` exists, it lists the
technical dependencies this domain needs to deliver complete, usable behavior — external
systems/libraries or cross-cutting technical setups (e.g. "internationalization structure
configured", "responsive navigation shell in place"). How much this list matters depends on
the unit — do not treat it with the same weight in every case:

- **First materialization of the domain** (a whole-domain spec, or the first feature that
  brings the domain to life) — this is where it matters most: go through EACH entry and check
  the current code. If a dependency is not built yet and this unit is the natural first place
  for it, include it in "what this spec implements" as cross-cutting infrastructure; if it is
  genuinely needed but this unit is not the place, record it as still-pending instead of
  dropping it silently; if it already exists, nothing to do. When it is unclear, escalate as a
  gap.
- **Delta or fix over an already-built domain** (a feature on an existing domain, a bug fix, or
  a cross-cutting change) — the base is normally already in place. A quick glance is enough:
  only account for a dependency that THIS change actively touches and finds missing. Do not
  re-audit the whole list nor block on setups unrelated to the delta.

## Cross-cutting spec (multiple domains)

Some changes are cross-cutting and do not belong to a single domain — e.g.:
ORM migration (Prisma → TypeORM), whitelabel theme/CSS swap. In these
cases the spec is **standalone**, not a child of any domain:

- Instead of the "Domain" section, record **"Domains involved"**: the list of
  each affected domain, with one line about the impact and the link to its
  authoritative documentation. Identify these domains yourself, cross-referencing the
  domain index, the `functional-map.md` and the real code.
- The "what this spec implements" Boundary covers the cross-cutting change
  **across the listed domains** — here the tasks may touch modules of
  several domains, because that IS the work unit (exception to the rule of not
  implementing code of another module).
- What stays **out**: domain behavior that is not part of this
  cross-cutting change — it remains a cross-domain dependency, does not become a task.
- The folder slug describes the change and is **not** prefixed by domain
  (e.g.: `030-orm-prisma-to-typeorm`).

## Current code state

Before defining Scope, Boundary and Acceptance criteria, acknowledge what already
exists in the repository code for this domain (modules, entities,
endpoints, screens). The spec describes the target state: what is already implemented and
remains correct is not rewritten as a new capability — keep "what this
spec implements" restricted to the delta and, when the contrast helps execution,
describe the current behavior versus the target. The acknowledgment serves to
cover the delta between what already exists and the target — what remains to be created, changed or
transformed (refactoring and rewriting what exists are legitimate targets) —, not
to recreate what already meets the goal. The business rules still come from the
authoritative documentation. If the acknowledgment
indicates that the target is already entirely met, do not invent scope: record
it as an open question (gap) for the requester to decide.

Likewise, if the acknowledgment indicates that the target of the change has no
real use in the application — it is dead code (no references or calls, a route or
endpoint turned off, a feature permanently disabled) —, do not take for granted
that the change must be applied over it: escalate as a decision to the human (the
requester), who decides the direction: change it anyway, remove the dead code,
or handle it in another way.

## Auxiliary artifacts tied to the "what"

When there are many requirements, derive `checklists/requirements.md` from
the user stories. Criterion: generate it if it helps avoid ambiguity in execution;
if it fits in a short section, it does not become a file. Non-standard artifacts
(e.g.: `migration-plan.md`, `rollback.md`) may be created when the nature
of the spec requires it.

## Ambiguity

Facing boundary ambiguity, an unresolved divergence between authoritative
artifacts (see "Divergence from authoritative documentation"), the need for a
non-standard artifact, or a pending technological decision without a firm basis,
record it as an open question to resolve with the human — do not decide silently.

## Complete spec.md example

The example below uses the fictional domain **Cost Centers** in the whole-domain
scenario (greenfield). In delta operations the structure is the same; what changes is the
scope (delta over the existing skill) and the conditional sections
("Current → new behavior" in a feature; "Expected behavior" in a bug).

Note how **Scope** describes product capabilities ("cost center CRUD",
"parent-child hierarchy", "activation and deactivation") and **Boundary** describes
technical artifacts ("Entities `CostCenter` and `CostCenterHistory`",
"REST endpoints `/cost-centers`", "Events `cost-center.created`"). The two
sections look at the same unit on different axes — one does not paraphrase the
other.

```markdown
# Spec: Cost Centers

## Overview

Registration and management of cost centers with hierarchy, validity period and integration
with the accounting code of the external system.

## Domain

- Slug: `cost-centers`
- Skill: [`.agents/skills/cost-centers/SKILL.md`](../../skills/cost-centers/SKILL.md)

## Scope

**In:**

- Cost center CRUD (code, name, description, accounting code, validity period).
- Parent-child hierarchy with unlimited depth.
- Manual activation and deactivation with history recording.
- Listing with filters by status and search by code or name, in flat
  or tree format.

**Out:**

- Bulk import via spreadsheet — becomes its own spec of the `data-import` domain.
- Assigning a cost center to projects — responsibility of the `projects` domain.
- Consolidated cost reports — responsibility of the
  `financial-reports` domain.

## Domain boundary

**This spec implements:**

- Entities `CostCenter` and `CostCenterHistory`.
- REST endpoints `/cost-centers` (CRUD, listing, deactivation, history).
- Rules for code uniqueness, acyclic hierarchy validation and consistent
  validity period.
- Events `cost-center.created`, `cost-center.updated`, `cost-center.deactivated`.

**Belongs to other domains (cross-domain, does not become a task here):**

- Validation "a project must reference an active cost center" → `projects` skill.
- Cost aggregation by cost center → `financial-reports` skill.
- Bulk import → `data-import` skill.

## User stories

1. As a financial administrator, I want to register cost centers with a unique
   code and accounting code, to reflect the financial structure of the company
   aligned with the external chart of accounts.
2. As a financial administrator, I want to organize cost centers in a parent-child
   hierarchy, to represent the organizational structure
   (headquarters → branch → department).
3. As a financial administrator, I want to deactivate a cost center without losing
   history, to prevent future use while keeping past records.
4. As an auditor, I want to consult the change history of each cost center,
   to reconcile old entries.

## Acceptance criteria

**Story 1 — Registration:**

- Given an authenticated administrator, when they send `POST /cost-centers`
  with a unique code, name, a valid accounting code and `valid_from`, then the API
  returns `201` with the generated ID.
- Given an authenticated administrator, when they send `POST /cost-centers`
  with an already existing code, then the API returns `409` with the message
  "code already registered".
- Given an administrator, when they send `POST /cost-centers` without a required
  field, then the API returns `422` with the list of missing fields.

**Story 2 — Hierarchy:**

- Given an existing parent cost center, when an administrator creates a child
  referencing the parent, then the child is linked to the parent and appears in the
  tree listing below it.
- Given an attempt to create a cyclic reference (A → B → A), when the registration
  is submitted, then the API returns `422` with the message "cycle detected".

**Story 3 — Deactivation:**

- Given an active cost center, when an administrator calls
  `POST /cost-centers/{id}/deactivate`, then the status changes to `inactive`, the
  deactivation date is recorded, and the `cost-center.deactivated` event is
  emitted.
- Given an already inactive cost center, when an administrator tries to deactivate it
  again, then the API returns `409` with the message "already inactive".

**Story 4 — History:**

- Given a cost center with recorded changes, when an administrator calls
  `GET /cost-centers/{id}/history`, then the API returns the chronological list
  with timestamp and responsible user.

## Cross-domain dependencies

- **`projects`** — consumes `GET /cost-centers/{id}` to validate that the
  referenced cost center is active when creating/editing projects.
- **`financial-reports`** — subscribes to the `cost-center.*` events to aggregate
  consolidated costs.
- **`data-import`** — may create/update cost centers in bulk; the uniqueness
  rule applied in this spec must be respected there too.

## Risks and observations

- Unlimited hierarchy can generate costly recursive queries in tree listing
  with high volume; technical decision in `research.md`.
- `accounting_code` is the integration key with the external ERP; changes can
  break reconciliation. Restricting editing after registration is still open —
  recorded as a gap in the initial checkpoint.
```
