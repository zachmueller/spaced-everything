# Custom scheduling algorithms

A custom spacing method lets you decide when a note should return based on your writing practice. SuperMemo remains the default; existing notes and settings need no migration.

## Set up a custom method

1. Copy [examples/custom-scheduler.js](../examples/custom-scheduler.js) into your vault as `scripts/custom-scheduler.js`. Create the `scripts` directory if needed.
2. In **Settings → Spaced Everything → Spacing methods**, add a method named `Custom example` and select **Custom script** as its spacing algorithm.
3. Set **Custom script** to `scripts/custom-scheduler.js`, relative to the vault root. Use forward slashes, a `.js` extension, and no `..` segments or absolute paths.
4. Keep the default review options. This dummy script ignores the selected score.
5. Assign this spacing method to a note with the plugin's **Update spacing method** command, or choose it when onboarding a note. Review it with **Log review outcome**.

The dummy example always returns an interval of one day and preserves the existing ease factor, regardless of the selected review outcome. Replace its function body with your own scheduling logic.

The script is read again on every review. Save edits to the file and they take effect on the next review without restarting Obsidian. Script changes do not retroactively reschedule notes.

## Function contract

Export a synchronous function using `module.exports`:

```js
module.exports = ({ interval, easeFactor, reviewScore }) => {
    return { interval: 1 }; // Omit easeFactor to preserve the current value.
};
```

| Input | Meaning |
| --- | --- |
| `interval` | Previous interval in days; positive and finite, possibly fractional |
| `easeFactor` | Previous ease, or the method/plugin fallback; positive and finite |
| `reviewScore` | Selected option's finite numeric score; custom scores may be outside 0–5 |

Before switching a Custom method to SuperMemo 2.0, correct every review score to a finite number from 0 to 5. The settings view blocks the switch and displays a notice until all scores are compatible.

The input is a fresh frozen object. The intended function is pure: calculate from these values and return a result without I/O, global mutation, or note edits.

Return an object with a **positive finite numeric `interval`** in days. You may also return a positive finite numeric `easeFactor`; omit it to preserve the input ease. Fractional intervals are supported without custom-result rounding. Other returned properties are ignored and cannot be used as frontmatter patches. The current input retains the plugin's existing frontmatter-to-number conversion and fallback defaults.

Only this export format is supported. ES module `export default`, imports, `require`, async functions, and Promise results are not part of the API. No persistent custom state, note text, or frontmatter object is passed to the function.

## Errors and trust

A missing script, syntax error, wrong export, thrown exception, or invalid result produces an error notice. The plugin does not fall back to SuperMemo and does not update the review interval, ease, or timestamp on calculation failure. It validates the whole result before assigning review fields, and only logs a successful review or shows the success notice after the frontmatter write resolves. A failed review is not left in the shared metadata queue for a later command to save.

**Use only scripts you wrote or trust.** Scripts execute with Obsidian's host privileges. Freezing the input is not a sandbox and cannot prevent a script from accessing globals or causing side effects. A synchronous infinite loop can freeze the application; there is no execution timeout. These failure guarantees cover the plugin's own metadata updates, not side effects caused by script code.

Loading uses Obsidian's vault adapter rather than desktop filesystem APIs. Automated tests cover scheduling and persistence with mocked Obsidian APIs. Desktop smoke tests confirmed a successful custom review and an error for a missing script without changing review metadata. Mobile compatibility has not been smoke-tested.
