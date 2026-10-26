<!--
Template of a FRONTEND test-cases.md.
Copy the structure to `.agents/specs/<NNN>-<slug>/test-cases.md`, remove these
comments and replace the `<...>` placeholders. Group by user story, one
`### TC-<n>` per test case with its classification (mandatory/recommended), and
close every case with `**Expected:**`. Describe the user interaction with the
interface — navigate, click/tap, type, swipe — and what the user sees, never
implementation details. State the platform when it matters (web browser, Android,
iOS). Everything a case cites must already be declared in the spec.md/plan.md.

EACH case starts from a known entry point (a route/URL or the app home) and walks
the FULL path to the action — open the route, locate the specific row/item, open
the panel/dialog/tab — before the step under test. Never begin mid-screen ("in the
X panel"): a case that skips how the user got there is not reproducible as an E2E
test. The content language follows the project's artifact convention.
-->
# Test cases: <unit name>

## Preconditions

- <App reachable: URL for web; installed build or emulator/simulator for mobile.>
- <Test users per profile and seed data; relevant feature flags.>

## Story 1 — <user story title from spec.md>

### TC-1 (mandatory) — <success flow that opens a nested panel from a list>

1. Open the `<listing>` (web: go to `/<path>`; mobile: open the `<listing>`
   screen).
2. Locate the `<item>` row (use the search/filter if needed) and tap/click its
   **<control that opens the panel>** action.
3. In the panel/dialog that opens, <do the action under test, e.g. select
   `<option>` and confirm>.

**Expected:** <what the user sees after the action, e.g. the success message
"<message>" and the updated `<item>` visible in the list>.

### TC-2 (mandatory) — <validation error surfaced in the UI>

1. Open `/<form route>` (mobile: open the `<form>` screen).
2. Submit `<form>` with `<field>` empty.

**Expected:** the inline error "<message>" appears under `<field>` and the form
is not submitted.

### TC-3 (recommended) — <mobile-specific interaction>

1. Open the `<listing>` screen (Android/iOS).
2. Pull to refresh — or rotate to landscape.

**Expected:** <the visible result of the gesture, e.g. the list reloads showing
the latest items>.

### TC-4 (mandatory) — <access denied / empty / offline state>

1. Sign in as `<user without permission>` (or seed no data / disable the network).
2. Open the `<screen>` (web: go to `/<path>`; mobile: open the `<screen>` screen).

**Expected:** <the empty/blocked/offline state the user sees, e.g. the message
"<message>" and no access to `<action>`>.
