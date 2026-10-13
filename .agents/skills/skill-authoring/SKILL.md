---
name: skill-authoring
description: >
  Pattern for creating, reviewing, updating or splitting any skill (domain or
  technical) in `.agents/skills/`, optimized for the context cost of the session
  window: how the agent discovers and loads skills, writing the `description` that
  decides triggering, progressive disclosure, body limit and use of `references/`,
  forbidden sections and the anti-drift maintenance section. Use when writing,
  editing, reviewing or reorganizing a `SKILL.md`, when deciding whether a rule
  becomes a skill or an always-on instruction, or when adjusting the frontmatter
  and the scope of skills.
---

# Skill authoring

> **Maintaining this skill**
>
> Update this document whenever **any rule described here** changes. The criterion
> is not *which* rule — it is the nature of the change: a skill-authoring pattern
> changed → update it; a cosmetic tweak to a specific skill that does not alter the
> pattern → leave it alone.

These rules apply to **any** skill in the repository — domain (business rule) or
technical (cross-cutting how-to), tool-generated or hand-written — and both when
**creating** and when **updating** a skill. They all turn on a single axis: a skill
is loaded on demand, so every authoring decision aims to **spend the least context**
of the session window for the most utility.

## What a skill is (and is not)

A skill lives in `.agents/skills/<slug>/SKILL.md` and is the authoritative source of
the durable decisions about a scope. It is **prescriptive**: it says what **must** and
what **must not** be done, not just what exists.

Do not create a skill whose **only** purpose is something that already has a better
home: isolated API documentation (lives in OpenAPI/Postman/Insomnia in the code, or
inside the business skill the API serves), a comment about a class (lives in the code
when applicable), a one-off recorded decision (lives in the commit/PR) or an
introductory step-by-step tutorial. This does not forbid such content from
**appearing** in a skill when it supports the durable rules of the scope — an API
contract cited within the business rule it exposes, a code example illustrating a
convention. What to avoid is turning into a skill some material that is mere
reference, with no prescriptive rule of its own (a skill dedicated solely to
documenting an API, for example).

A **domain skill** carries the authoritative knowledge of its domain, and that knowledge lives in
one of two places: **inside** the skill (the durable business rules, values and flows) or, when the
project keeps it in an **external source** (a wiki, Confluence, an MCP space), **outside** it — with
the skill holding the authoritative pointer to that source: where the content lives, how to access
it and how it is organized. Both are prescriptive, authoritative roles, so the pointer form is not
the "mere reference" anti-pattern above: the skill is still the single entry point for the domain,
it just holds a route instead of the rules, and must not be "fixed" by inlining the external content.
Which of the two applies is a project-wide decision (the domain source of truth), not a per-skill
one, and only domain skills can take the pointer form — technical (cross-cutting) skills are always
local how-tos.

## How the agent discovers and loads skills

Understanding the mechanism is what justifies each rule below. The agent:

- **does not do vector search at runtime.** It loads the `name` and the `description`
  of **all** skills as static text in the system prompt and decides triggering by
  reading that text;
- **uses the literal text.** The `description` is not summarized or paraphrased before
  reaching the model — what you write is what decides loading;
- **pays a fixed cost per skill** (approx. 100 tokens: `name` + `description`) that is
  **always** present. The body of the `SKILL.md` only enters the context when the skill
  is actually triggered.

### Progressive disclosure (3 levels)

| Level | What it loads | When | Cost |
|---|---|---|---|
| L1 — Metadata | `name` + `description` | always (startup), for all skills | ~100 tokens/skill |
| L2 — Instructions | body of the `SKILL.md` | when the skill is triggered | keep it lean |
| L3 — Resources | files in `scripts/`, `references/`, `assets/` (and others) | when the body references them | on demand |

L3 resources follow the standard structure of a skill, all optional: `scripts/`
(executable code the skill invokes), `references/` (documentation loaded on demand)
and `assets/` (templates, examples and other files). The `SKILL.md` is the only
mandatory file; any resource directory is read only when the body references it.

The whole design serves one goal: cheap, always-present metadata; heavy content only
when needed. Optimizing the `description` is optimizing the only level that is always
in the context; trimming the body and pushing detail into the L3 resources protects
the level that enters when the skill triggers.

## The `description` is what decides triggering

It is the most important field of the frontmatter: literally the only text that decides
whether the skill is loaded. Two layers of limit:

- **absolute ceiling: 1024 characters** (above that the skill is rejected);
- **comfort zone: ~300–500 characters** (1–3 dense sentences). It matches the
  reference cost of ~100 tokens and is what survives discovery-budget cuts in agents
  that shorten/omit descriptions when the initial list overflows.

Do not use all 1024 characters just because they fit: a long description dilutes the
triggers, worsens the match and consumes a disproportionate discovery budget.

### Structure: what it does + when to use + trigger words

Put the main use case and the triggers **at the start** (front-loading): that way,
even truncated, the description still matches. The triggers are the words that appear
in real requests — cite them in running text, **without** lists, sections or a separate
`keywords` field.

- **Good:** `Standardizes Terraform plan reviews. Use for Terraform, plan, diff,
  infrastructure review, IAM, networking and cost. Classifies changes and prioritizes
  inspection of destructive changes.`
- **Bad:** `Helps with infrastructure reviews.` (vague, no triggers, does not match
  specific requests).

### Action trigger vs. topic trigger

For **cross-cutting/technical** skills (they apply in any domain), anchor on **verbs**
that appear in the requests: instead of "Testing best practices", prefer "Use whenever
you are writing, reviewing or modifying any test". **Domain/business** skills already
have their own vocabulary and match well by **topic** — the risk of overlap between
them is low.

## Frontmatter: fields and rules

Keep the frontmatter **lean**. The essentials are two fields:

- `name`: 1–64 characters, **lowercase**, only `a-z 0-9 -`, no hyphen at the
  start/end and no `--`, **identical to the directory name** and to the slug. Errors
  here make the skill **fail silently**: uppercase, consecutive hyphens, a namespace
  prefix (`org/skill`, `org:skill`) or a `name` different from the directory;
- `description`: required, non-empty, follows the rules of the previous section.

Additional fields (`license`, `metadata`, etc.) enter **only sparingly** and when
there is a real reason. When a project convention requires a field (for example a
`metadata.type` to classify the skill), include it; otherwise, do not invent fields
(`tags`, `version`, `category`, `parameters`) that only inflate the always-present
metadata.

**Security:** the frontmatter enters the system prompt, so it is a prompt-injection
surface. Treat third-party skills as code dependencies: use trusted sources and review
them before adopting.

## Skill or always-on instruction?

Not every rule should become a skill. A skill is **conditional loading** — it depends
on the agent deciding to trigger it. Universal rules are more reliable in an
always-present channel (`AGENTS.md`/`CLAUDE.md`).

- **Becomes a skill** when the procedure is specific and heavy, only makes sense "when
  the topic is X", or brings a how-to/examples/`references/`.
- **Becomes an always-on instruction** when the rule applies to nearly every task: a
  universal convention (naming, folder structure, lint, "never commit a secret") or a
  short, persistent guardrail.

Rule of thumb: a universal and short convention → instructions file; a rich,
on-demand flow → skill. Apply the criterion by substance: a one- or two-line,
declarative rule goes to the instructions; a substantial how-to (needs steps,
examples, several lines) becomes a skill loaded on demand. Never record the same
decision in both places. If, even with this criterion, the destination remains
ambiguous, **do not decide alone** — escalate the decision to the human instead of
choosing `AGENTS.md` or a skill on your own.

## File structure

```
.agents/skills/
  <slug>/
    SKILL.md            (mandatory, always with this name)
    scripts/            (optional — executable code the skill invokes)
    references/         (optional — documentation loaded on demand)
    assets/             (optional — templates, examples and other files)
```

- the slug uses kebab-case and describes the scope; it may be in English when it
  reflects the technical term already used in the project;
- the main file is **always** named `SKILL.md`, so that tools and agents locate it by
  path pattern;
- the folder name is the canonical name of the skill — it is the value of the `name`
  field;
- `scripts/`, `references/` and `assets/` are all optional and follow the standard
  skill structure; use what the content calls for (and other files/folders when it
  makes sense), without creating an empty directory just to fill out the skeleton.

## Body size and progressive disclosure (L2 → L3)

The body of the `SKILL.md` is loaded in full when the skill triggers. Keeping it short
reduces the context cost (L2) and improves human reading. Treat **500 lines** as a
trigger for reflection, not a rigid rule:

- naturally short skills stay well below that — do not stretch to fill it;
- when you exceed it, move extensive detail (templates, skeletons, long technical
  references, detailed rules that support a short principle) to `references/` (L3);
- **completeness comes before the limit.** Never compress or omit a mandatory rule to
  fit within 500 lines. If the content is a rule, it exists; what changes is **where
  it lives** (`SKILL.md` or `references/`).

When moving part of the content to `references/`, the `SKILL.md` keeps a short summary
of the moved section and a link to the detail file, so that reading the main file
stays coherent without opening the supplements. Each file in `references/` also carries
its own maintenance block. Do not use `references/` to hide from the index a rule that
should be mandatory: if it is a rule, it goes in the `SKILL.md`.

## Forbidden sections in the body

- **No "When to use" / "When to load this skill" section (or equivalent).** That
  information lives **exclusively** in the `description` of the frontmatter — the agent
  decides loading by it. Repeating it in the body is redundant and pollutes the useful
  content.
- **No meta-description of the file itself** ("This SKILL.md describes..."). The body
  is already the authoritative source; it does not need to announce itself.

## Maintenance section (anti-drift)

Every skill includes, right after the H1 title, a **"Maintaining this skill"**
blockquote. It **does not enumerate** the skill's rules — the scope of maintenance is
the whole document. It exists to teach the agent to *discriminate* what triggers an
update:

- **behavior/decision changes → update:** the rule described by the skill was changed
  (new step, new criterion, new semantics);
- **technical refactor → do not touch:** renaming, helper extraction, internal
  reorganization that preserves the rule. The skill describes the decision, not the
  structure of the code;
- **semantic divergence with no recorded decision → escalate to the human.** When the
  skill says X and the code/state does Y and there is no decision that resolves it, do
  not "fix" the skill to match the code nor the other way around: it is a human
  decision, not yours.

Do not enumerate the rules in the block: a list reads as **closed** (a rule outside it
rots in silence) and becomes a mirror of the scope (double maintenance). Reference the
whole document ("any rule described here") and preserve the behavior × refactor
criterion, which is what cannot be inferred from the rest of the document.

## Creating vs. updating an existing skill

Before creating a new skill, find out from the `description` whether a skill already
covers the same scope. When one exists, the result is **that same skill, evolved** —
never a second one in parallel. The scope ends with a single authoritative
documentation.

- if it is already at the canonical path/slug → update it in place;
- if it is in another folder/name → **move/rename** it to `.agents/skills/<slug>/`,
  adjusting the frontmatter `name`, carrying over the `references/` files and removing
  the old origin. Renaming is how you respect the slug without discarding what already
  exists;
- treat the existing skill as a basis to extend/consolidate (never replace blindly):
  incorporate what **does not conflict**, rewrite for clarity when it helps, and do
  not delete knowledge without it remaining accessible somewhere else.

When comparing the skill with the reality it documents, separate:

- **mechanical staleness** — the skill describes the **same intended rule**, only with
  an outdated detail (a new field, a cosmetic name, an old example). Update it: it is
  maintenance, not divergence;
- **semantic divergence** — the skill and reality describe **different intended**
  **behaviors** for the same rule. Here you do **not** decide who wins: it is a
  decision to escalate to the human, unless a recorded decision exists that resolves
  it directly.

## One skill per scope

A skill covers **one coherent scope of rules**. Signs that it is worth **splitting in
two**: the skill needs to reference itself ("described in section X above") several
times; two sections are consumed by different contexts and rarely at the same time;
one section describes a contract/abstraction and another describes a concrete
implementation (a good candidate for `SKILL.md` + `references/`).

Signs that **two become one**: they reference each other cyclically; keeping the two
in sync requires coordinated editing on every change; the scope of each one alone does
not make sense without the other. When merging, keep the slug that best represents the
unified scope and remove the duplicate entirely (no phantom `SKILL.md` redirecting).

Avoid "umbrella" skills that cover many scopes just to avoid creating several small
ones: a skill that is too big ends up ignored.

## Do not reference another skill

A skill **does not reference another skill** — not by name, not by link, not by "see
`X` for more details". Who decides to load a complementary skill is the agent, by the
`description` of each one. Cross-references bias the reading order, create coupling
(renaming one breaks the other) and demote the index of descriptions.

Instead: describe the concept in a **self-contained** way to the minimum needed to
make sense within the scope of this skill; when the subject is covered in depth by
another, use enough neutral vocabulary for the agent to recognize the topic and decide
on its own. If you catch yourself tempted to write "see the `X` skill", either the
content of `X` should be here, or the `description` of `X` needs to be clearer. Links
**within the same skill** (between `SKILL.md` and `references/`) are allowed and
encouraged.

## Voice and content

A **prescriptive and declarative** tone: "must", "must not", "use X when...". Avoid a
narrative tone ("let us see", "it might be useful") — skills are contracts, not
tutorials. Do not use emojis, unless explicitly requested. Established technical terms
in English may be kept when they are already the team's current vocabulary.

### State, not transition

A skill describes the **current** contract, for a reader who knows neither its previous
versions nor the conversation that motivated the last edit. When updating a skill because
the rule changed, rewrite the affected section as if the rule had always been that one: a
skill never narrates its own evolution. Sentences that only stand by comparison with the
previous version ("the flow now validates before persisting", "this field is no longer
optional") are out — what changed lives in the commit message and the pull request
description.

Prescriptive negation stays legitimate ("must not ..."): it defines the contract and guards
a future change, because a reader would otherwise plausibly do the forbidden thing. What
does not belong is the negation that merely contrasts with the skill's own past, with an
alternative nobody would try, or with what the section already made clear. Before closing
the edit, re-read what you wrote and cut those: "no longer", "used to", "is now", "instead
of" and "unlike" are the usual symptoms.

When living with legacy is itself the active rule, the contrast is the content — write it as
a rule ("when you find X in the code, migrate it to Y"), with the legacy named as a state to
handle, never as history of the skill.

## Example templates

Two commented skeletons serve as a starting point — one per skill type. A **business
(domain) skill** documents the durable decisions of a domain; a **technical
(cross-cutting) skill** documents a reusable how-to with no business rule of its own.
Copy what fits and adapt it to the scope; the templates are neither mandatory nor
exhaustive. They live in `assets/` (templates to copy), not in `references/`
(documentation read on demand).

- Business (domain) skill: `assets/domain-skill-template.md`.
- Technical (cross-cutting) skill: `assets/technical-skill-template.md`.

Both come in the format this skill preaches: a `description` with triggers at the
start, a maintenance block after the H1 and no "When to use" section in the body.

## Common failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| Skill never triggers | vague `description` or no triggers | real words/verbs from the requests, at the start |
| Wrong skill triggers | overlapping scopes | differentiate the descriptions or merge the skills |
| Skill does not load | invalid `name` or ≠ directory; namespace in the name | fix the `name` format |
| Skill vanishes from the list | long descriptions overflowed the discovery budget | shorten, front-load triggers, reduce the number of skills |
| Rule ignored across many tasks | it should be always-on | move it to `AGENTS.md`/`CLAUDE.md` |
| Inflated context | body too big | move detail to `references/` (L3) |

## Checklist

- [ ] `name` lowercase, with hyphens, 1–64 characters, **equal to the directory**, no
      `--` and no namespace prefix.
- [ ] `description` in the ~300–500 character zone (hard ceiling 1024), with the use
      case and triggers **at the start**, in the "what it does + when to use +
      triggers" format.
- [ ] Action verbs for cross-cutting skills; domain vocabulary for business skills; no
      scope overlapping with another skill.
- [ ] Universal rule? Not a skill — it goes to an always-on instruction.
- [ ] "Maintaining this skill" block after the H1, without enumerating rules.
- [ ] No "When to use" section and no meta-description in the body.
- [ ] Lean body; heavy detail in `references/` with a summary and link in the
      `SKILL.md`.
- [ ] When updating: skill evolved at the canonical path, without duplicating;
      mechanical staleness fixed, semantic divergence escalated.
- [ ] Text describing the current contract: no trace of the previous version, no negation
      that fails to guard a plausible mistake.
