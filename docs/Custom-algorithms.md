# Custom scheduling algorithms

A custom spacing method lets you decide when a note should return based on your writing practice. SuperMemo remains the default; existing notes and settings need no migration.

## Set up a writing-review method

1. Copy [examples/evergreen.js](../examples/evergreen.js) into your vault as `scripts/evergreen.js`. Create the `scripts` directory if needed.
2. In **Settings → Spaced Everything → Spacing methods**, add a method named `Evergreen writing` and select **Custom script** as its spacing algorithm.
3. Set **Custom script** to `scripts/evergreen.js`, relative to the vault root. Use forward slashes, a `.js` extension, and no `..` segments or absolute paths.
4. Keep or add the review options **Fruitful = 1**, **Ignore = 3**, and **Unfruitful = 5**. Set the default interval to `1` day.
5. Assign this spacing method to a note with the plugin's **Update spacing method** command, or choose it when onboarding a note. Review it with **Log review outcome**.

The example returns fruitful notes tomorrow, multiplies ignored notes' intervals by 1.5, and doubles unfruitful notes' intervals, with a 90-day cap. These are editable starting values, not empirically established optimal intervals. Ignore means explicitly selecting that outcome; untouched notes are not rescheduled. Remove a note from the queue when you no longer want it resurfaced.

The script is read again on every review. Save edits to the file and they take effect on the next review without restarting Obsidian. Script changes do not retroactively reschedule notes.

## Function contract

Export a synchronous function using `module.exports`:

```js
module.exports = ({ interval, easeFactor, reviewScore }) => {
    return { interval: Math.min(90, interval * 1.5) };
};
```

| Input | Meaning |
| --- | --- |
| `interval` | Previous interval in days; positive and finite, possibly fractional |
| `easeFactor` | Previous ease, or the method/plugin fallback; positive and finite |
| `reviewScore` | Selected option's finite numeric score; custom scores may be outside 0–5 |

The input is a fresh frozen object. The intended function is pure: calculate from these values and return a result without I/O, global mutation, or note edits.

Return an object with a **positive finite numeric `interval`** in days. You may also return a positive finite numeric `easeFactor`; omit it to preserve the input ease. Fractional intervals are supported without custom-result rounding. Other returned properties are ignored and cannot be used as frontmatter patches. The current input retains the plugin's existing frontmatter-to-number conversion and fallback defaults.

Only this export format is supported. ES module `export default`, imports, `require`, async functions, and Promise results are not part of the API. No persistent custom state, note text, or frontmatter object is passed to the function. If you change the example's review options or scores, update its switch cases to match.

## Errors and trust

A missing script, syntax error, wrong export, thrown exception, or invalid result produces an error notice. The plugin does not fall back to SuperMemo and does not update the review interval, ease, or timestamp on calculation failure. It validates the whole result before assigning review fields, and only logs a successful review or shows the success notice after the frontmatter write resolves. A failed review is not left in the shared metadata queue for a later command to save.

**Use only scripts you wrote or trust.** Scripts execute with Obsidian's host privileges. Freezing the input is not a sandbox and cannot prevent a script from accessing globals or causing side effects. A synchronous infinite loop can freeze the application; there is no execution timeout. These failure guarantees cover the plugin's own metadata updates, not side effects caused by script code.

Loading uses Obsidian's vault adapter rather than desktop filesystem APIs. This implementation has automated tests with mocked Obsidian APIs; live desktop and mobile smoke tests are still needed before claiming platform compatibility.
