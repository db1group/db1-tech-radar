# How to contribute

### Your First Pull Request

Working on your first Pull Request? You can learn how from this free video series:

**[How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)**

### Sending a Pull Request

The engineering team is monitoring for pull requests. We will review your pull request and either merge it, request changes to it, or close it with an explanation.

**Before submitting a pull request,**  please make sure the following is done:

1. Fork  [the repository](https://github.com/db1group/db1-tech-radar)  and create your branch from  `main`.
2. Read the [tech radar instructions](https://techradar.db1.com.br/help-and-about-tech-radar.html) to understand which quadrant your technology should be in.
3. Read the [pull request template](#pull-request-template) and fill the required information.
4. Add the new technology at "'/public/db1-opinion.json".

**\*important note:** every new technology submitted in your pull request should be in **"ASSESS RING"** for previous evaluation. The engineering team will decide after studying it where it should be promoted to (other rings).\*

### Pull Request Template

- [ ] Technology name:
- [ ] Why do you think it deserves to be here?
- [ ] What are the main benefits of this tech adoption?
- [ ] What are the potencial drawbacks of this tech adoption?

### Adding or reordering a quadrant

The number of quadrants is configuration, not code: from one to six quadrants are drawn from the
screen slot of each quadrant, so adding, removing or reordering a quadrant is editing data files
only. None of the steps below require touching a `.tsx` or a `.scss` file.

To **add a quadrant**, edit `public/config.json`:

1. In `quadrants`, add `"<slug>": "<English name>"`. The slug is a stable, lowercase,
   hyphen-separated identifier; it is the key used in the data, in the grouping and in the URL, so
   it must be a valid URL segment (no slash, space or accent).
2. In `quadrantsMap`, add an entry for the same slug with:
   - `colour` — the sector and blip colour;
   - `txtColour` — the text colour used over that background;
   - `position` — the number shown in the "QUADRANT N" label, for the reader only;
   - `order` — the screen slot: the slice of the circle the quadrant occupies, counted from 1 to N
     clockwise from the 12 o'clock position, which also places its label block. The `order` values
     are contiguous from 1 to N, with no gap and no repetition.

Then add the translated text, once per language, in `src/i18n/translations/pt.json`, `en.json` and
`es.json`:

3. `quadrants.<slug>` — the short label shown next to the sector.
4. `pageHelp.quadrants.<slug>` — an object with `name` and `description`, the long text shown on the
   help page. A quadrant missing either entry in any of the three languages is reported by
   `validateConfig`, and the site shows the configuration error screen instead of the radar.

Finally, give the quadrant some content and publish it:

5. In `public/db1-opinion.json`, add the technologies classified in the new quadrant with its slug.
   As with any new technology, each one enters in the **assess** ring for prior evaluation.
6. Bump `REACT_APP_BUILDHASH` in `.env`. The browser caches `config.json` by this value, so without
   a new hash a returning visitor keeps seeing the previous taxonomy.
7. Run the tests with `yarn test`. `src/validateConfig.test.ts` also runs on deploy, which blocks a
   broken `config.json` before the build.

To **reorder quadrants**, change only `order`. The `position` the reader sees and the screen slot are
two separate numbers, so moving a quadrant around the circle never renumbers the "QUADRANT N" labels,
and renumbering a label never moves its sector.

A few limits and behaviours to keep in mind:

- **From one to six quadrants.** The geometry draws the sectors, the background glow and the blips
  for any count, but the ceiling is six: the places for the label blocks come from the table in
  `src/components/RadarGrid/radar-grid.scss`, which declares a place per slot up to six. Raising the
  ceiling to seven or more is the one case that needs new cases added to that table. A seventh
  quadrant is reported by `validateConfig` with a readable message pointing at this table.
- **Blip positions are random.** The spot of each blip inside its sector and ring band is drawn on
  every load, so two visits show the same technology in different places.
- **Ring labels with a count other than four.** The left and right ring labels sit on the horizontal
  axis, which is a sector boundary only with four quadrants. With any other count they fall inside a
  sector and may touch a blip — a known cosmetic limitation, not a defect.
