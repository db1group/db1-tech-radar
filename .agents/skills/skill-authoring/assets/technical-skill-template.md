<!--
Example template of a TECHNICAL (cross-cutting) skill.
Copy it to `.agents/skills/<slug>/SKILL.md`, remove these comments and replace the
`<...>` placeholders. Documents a reusable how-to, with no business rule of its own.
The content language follows the project's artifact convention.
-->
---
name: <pattern-slug>
description: >
  <One sentence of the how-to the skill covers>. Use whenever <verbs + terms that
  characterize relevant tasks: verb1, verb2, term3>, cited in running text.
  Maximum 1024 characters (comfort zone ~300–500).
metadata:
  type: technical-skill
---

# <Pattern name>

> **Maintaining this skill**
>
> Update it whenever the pattern changes. A refactor that preserves the pattern does
> not require a change; a change in the how-to does.

## Overview of the pattern and the problem it solves
<What the pattern is and why it exists.>

## How to apply
<Concrete steps and conventions, with examples when useful.>

## Tools and artifacts involved
<Tools cited by name and where the artifacts live (e.g.: where the `.openapi.yaml` lives).>

## Constraints and known pitfalls
<Limits and gotchas of the pattern.>
