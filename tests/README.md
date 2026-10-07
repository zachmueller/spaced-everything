# Unit tests

Fast, hermetic tests for the plugin's logic. No Obsidian, no vault, no network:
`npm test` runs the whole suite in well under a second.

```bash
npm test                                          # everything
node --test tests/scheduling-baseline.test.cjs    # one file
node --test --test-name-pattern "golden" tests/*.test.cjs
```

## Relationship to `e2e/`

| | `tests/` | `e2e/` |
| --- | --- | --- |
| Runs against | `src/*.ts`, bundled in memory | the built `main.js` inside real Obsidian |
| Obsidian API | substituted (`tests/helpers/harness.cjs`) | the real thing |
| Cost | ~100 ms for the suite | ~10–15 s per test (app launch) |
| Catches | wrong arithmetic, wrong wiring, wrong contract | anything that only breaks inside the app |

They are complements. A calculation change should fail here first; a change to how
frontmatter actually lands on disk, or to a settings pane, needs `e2e/`.

## How the harness works

There is no `obsidian` module outside the app, so `tests/helpers/harness.cjs`
bundles the TypeScript with esbuild — already a devDependency, and configured to
match the real build (`format: "cjs"`, `platform: "node"`) — and substitutes a
minimal stand-in for `obsidian`. Nothing is generated on disk.

`createPluginHarness()` returns a plugin instance plus recorders for everything
the code under test reaches for:

| Field | What it holds |
| --- | --- |
| `plugin` | The plugin, constructed without `onload()` |
| `file` | The `TFile`-shaped note under test |
| `frontmatter` | The note's live frontmatter — mutated only if the code writes directly |
| `queued` | Every `queueFrontmatterUpdate()` call, in order |
| `processedQueue` | One entry per `processFrontmatterQueue()` call |
| `notices` | Every `new Notice(...)` message, in order |
| `logs` | Every `logger.log()` call, as argument arrays |
| `prompts` | Every suggester opened, as `{ promptText, items }` |
| `answerSuggester(...choices)` | Answer the next prompt(s); `null` means Escape |

An unanswered suggester throws instead of hanging, so an unexpected prompt fails
loudly rather than timing out.

Two opt-in options control what a queue flush does:

- `applyQueue: true` — each `processFrontmatterQueue()` applies the updates queued
  since the last flush to `frontmatter`. `frontmatter` then shows the note as it
  ends up, whether the plugin queued its updates or wrote them directly. Tests of
  the *resulting note* should use this and assert on `frontmatter`, not `queued`,
  so a change of persistence mechanism doesn't force them to be rewritten.
- `realQueue: true` — installs the real `FrontmatterQueue` (per-file merge, cleared
  on flush), for tests that depend on its merge order. Implies `applyQueue`.

`plugin.loadData` / `plugin.saveData` are stubbed (`saveData` records into
`plugin.savedData`), so `loadSettings()` can be driven with a saved `data.json`.

The settings tab has its own harness, `tests/helpers/settings-harness.cjs`. Its
`Setting` stand-in records each rendered setting's name, text boxes, dropdown and
container, so `find("Spacing algorithm").dropdown.change("Custom")` fires the
real handler. It also counts `saveSettings()` calls and collects notices.

Two things the harness deliberately mirrors rather than fixes:

- **Non-strict CJS.** `suggester()` in `src/suggester.ts` reads `this.app` from an
  unbound function call, which resolves to the global object at runtime. The
  harness sets `globalThis.app` so that keeps working. Change the bundle format
  and the plugin breaks in the app, not just here.
- **Hand-mirrored `DEFAULT_SETTINGS`.** It is not exported from `src/main.ts`, so
  `defaultSettings()` duplicates it — the same trade-off `e2e/lib/test-helpers.ts`
  makes with `buildDefaultSettings()`. Keep both in sync.

## The `*-baseline.test.cjs` files

These are **characterization tests**. Their expected values were recorded from the
implementation as it shipped, not derived from a specification, and that includes
behavior that looks wrong:

- `se-interval: 0` falls back to the default, because the code uses `||`.
- Finite review scores already stored outside 0–5 are not clamped by SuperMemo.
  The settings UI requires 0–5 for SuperMemo; Custom accepts any finite score.
- A cancelled review drops an `se-method` repair that was already queued.
- `loadSettings()` preserves saved methods without migrating their algorithm values.

Intentional changes in #36 are marked with `// Behavior change (#36): ...` in
these tests:

- Non-numeric, negative, or non-finite resolved interval/ease, non-finite scores,
  and invalid scheduler results (including zero and overflow) are rejected before
  saving. Stored falsy values still use the defaults described above.
- Reviews save directly against fresh frontmatter; a successful save removes
  superseded scheduling fields from the queue while retaining unrelated edits.
  Save failures show a notice instead of escaping the review command.
- Logging happens after persistence; logging errors cannot fail a saved review.
- Legacy Custom methods without a script and unknown/missing algorithm values
  retain SuperMemo scheduling, with one fallback notice per plugin session.
- Score entry rejects empty strings and partially numeric text. Custom scores
  may be outside 0–5, and switching to SuperMemo requires compatible scores.
- The custom script box is enabled now that scripts are implemented.

Each remaining recorded behavior is marked in a comment as recorded-not-endorsed. The point is to make
refactors checkable: if a change is meant to preserve behavior, every assertion
here must still pass untouched. If an assertion has to change, the change is a
behavior change — which may be the right call, but it should be a decision rather
than a side effect.

So: **do not "fix" a baseline expectation to make a build green.** Either the code
regressed, or the behavior change is intentional and the updated vector plus a note
about why is the record of it.

| File | Pins |
| --- | --- |
| `scheduling-baseline.test.cjs` | The SM-2 arithmetic: 96 golden vectors plus rounding order, the 1.3 ease floor, the 1-day interval floor, and out-of-range scores |
| `update-interval-baseline.test.cjs` | `updateInterval()`'s contract: where prior state is read, default resolution, direct persistence, input validation, the notice text, and log ordering |
| `review-flow-baseline.test.cjs` | `logReviewOutcome()`: the prompt, score mapping, Remove, cancel, onboarding, and whether the queue gets flushed; plus the note's end state after a review, including an `se-method` repair and stale queued values |
| `algorithm-dispatch-baseline.test.cjs` | Legacy algorithm fallback and its one-time notice; `loadSettings()` keeps saved values as saved |
| `settings-baseline.test.cjs` | The settings tab: review-score parsing and algorithm-specific ranges, the algorithm dropdown, and which fields it shows |

`update-interval-baseline.test.cjs` also pins the failure edges: out-of-range
numbers, a rejected log write, and a failed frontmatter read.

The end-state tests (anything using `applyQueue`/`realQueue`) are written so a
correct change to *how* a review is persisted passes them unchanged. If one of
those fails, the note now ends up different, and that is the thing to explain.
