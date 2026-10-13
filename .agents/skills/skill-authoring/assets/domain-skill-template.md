<!--
Example template of a BUSINESS (domain) skill.
Copy it to `.agents/skills/<slug>/SKILL.md`, remove these comments and replace the
`<...>` placeholders. Document only what the sources support; an unknown value or a
divergence with no decision is a question to escalate to the human, never an invented
value. The content language follows the project's artifact convention.

Pointer variant: when the project's authoritative domain documentation lives in an EXTERNAL
source (a wiki, Confluence, an MCP space), replace the business-rule sections below with a short
pointer body — a one- or two-line orientation, then WHERE the domain content lives in that
source, HOW to access it, and HOW it is organized. Do not restate the rules.
-->
---
name: <domain-slug>
description: >
  <One sentence of what the domain covers>. Use when <main trigger + terms that
  characterize relevant tasks: term1, term2, term3>, cited in running text.
  Maximum 1024 characters (comfort zone ~300–500).
metadata:
  type: domain-skill
---

# <Domain name>

> **Maintaining this skill**
>
> Update it whenever the behavior of this domain changes purpose, keeping the skill
> faithful to the implemented behavior. A divergence between skill and code with no
> recorded decision is escalated to the human, not resolved on your own.

## Domain overview
<What the domain is and which business problem it solves.>

## Business rules
<Concrete values, conditions and exceptions — each rule backed by the sources.>

## Flows and lifecycle
<States and transitions, when they exist.>

## Entities and data
<Entities, API contracts (e.g.: `POST /orders`) and reference tables.>

## Constraints and validations
<Validation rules and limits, when they exist.>

## Integrations and external dependencies
<External services cited by name (e.g.: payment gateway, e-mail provider).>
