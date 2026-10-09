/**
 * Legacy spacingAlgorithm behavior that must survive the introduction of custom scripts.
 *
 * Before #36, updateInterval() always called superMemo(), whatever the
 * method's algorithm says. The settings dropdown has offered "Custom script"
 * since the spacing-methods refactor (b258973), with the script field disabled
 * and marked not implemented, so a vault can already contain methods saved as
 * `Custom` with an empty script path — and their reviews use SuperMemo.
 *
 * That makes the stored value part of the upgrade contract. Anything that starts
 * dispatching on it decides what happens to those existing methods, and these
 * tests make that a visible decision rather than a side effect.
 */

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { createPluginHarness, defaultSpacingMethod } = require("./helpers/harness.cjs");

const FALLBACK_NOTICE = "Using SuperMemo 2.0 for a legacy spacing method with no custom script or an unknown algorithm. Check spacing method settings.";

const TIMESTAMP = "2026-01-01T12:00:00Z";

/** The SuperMemo result for interval 7, ease 2.5, score 5 (see scheduling-baseline). */
const SUPERMEMO_7_25_5 = { newInterval: 18.2, newEaseFactor: 2.6 };

test("legacy spacingAlgorithm values without a configured script still schedule with SuperMemo", async () => {
	// Recorded, not endorsed: `Custom` with no script, a misspelling, and a missing
	// value all historically got SuperMemo. 'SuperMemo 2.0' (with a space) is the id
	// used in the src/types.ts doc example; the dropdown saves 'SuperMemo2.0'.
	for (const spacingAlgorithm of ["SuperMemo2.0", "Custom", "SuperMemo 2.0", undefined, "", "typo"]) {
		const harness = createPluginHarness({ frontmatter: { "se-interval": 7, "se-ease": 2.5 } });
		const method = defaultSpacingMethod({ spacingAlgorithm, customScriptFileName: "" });

		assert.deepEqual(
			await harness.plugin.updateInterval(harness.file, {}, 5, TIMESTAMP, method),
			SUPERMEMO_7_25_5,
			`spacingAlgorithm ${JSON.stringify(spacingAlgorithm)} should schedule with SuperMemo`,
		);
		// Behavior change (#36): preserve legacy scheduling but explain the fallback once per plugin session.
		assert.deepEqual(harness.notices, [...(spacingAlgorithm === "SuperMemo2.0" ? [] : [FALLBACK_NOTICE]), "Interval updated from 7 to 18.2"]);
	}
});

test("a note on a Custom method with no script is reviewed like any other", async () => {
	const harness = createPluginHarness({
		frontmatter: { "se-interval": 7, "se-ease": 2.5, "se-method": "Custom method" },
		settings: {
			spacingMethods: [
				defaultSpacingMethod({
					name: "Custom method",
					spacingAlgorithm: "Custom",
					customScriptFileName: "",
				}),
			],
		},
		applyQueue: true,
	});
	harness.answerSuggester("Unfruitful");

	await harness.plugin.logReviewOutcome();

	assert.equal(harness.frontmatter["se-interval"], 18.2);
	assert.equal(harness.frontmatter["se-ease"], 2.6);
	assert.match(String(harness.frontmatter["se-last-reviewed"]), /^\d{4}-\d{2}-\d{2}T/);
	assert.equal(harness.frontmatter["se-method"], "Custom method");
	// Behavior change (#36): an unconfigured legacy Custom method now receives a fallback notice.
	assert.deepEqual(harness.notices, [FALLBACK_NOTICE, "Interval updated from 7 to 18.2"]);
});

test("loadSettings does not migrate a saved method's spacingAlgorithm", async () => {
	// A fresh install gets the default method's 'SuperMemo2.0'.
	const fresh = createPluginHarness();
	fresh.plugin.loadData = async () => ({});
	await fresh.plugin.loadSettings();
	assert.equal(fresh.plugin.settings.spacingMethods[0].spacingAlgorithm, "SuperMemo2.0");

	// Saved methods replace the default array wholesale (a shallow Object.assign),
	// so a saved value, or a missing one, reaches updateInterval() as it was saved.
	const saved = createPluginHarness();
	const { spacingAlgorithm: _omitted, ...legacy } = defaultSpacingMethod({ name: "Legacy" });
	const custom = defaultSpacingMethod({ name: "Picked Custom", spacingAlgorithm: "Custom" });
	saved.plugin.loadData = async () => ({ spacingMethods: [legacy, custom] });
	await saved.plugin.loadSettings();

	const [loadedLegacy, loadedCustom] = saved.plugin.settings.spacingMethods;
	assert.equal(loadedLegacy.spacingAlgorithm, undefined);
	assert.equal(loadedCustom.spacingAlgorithm, "Custom");
	assert.equal(loadedCustom.customScriptFileName, "");
});

test("legacy fallback warns only once per plugin session", async () => {
	const harness = createPluginHarness({ frontmatter: { "se-interval": 7, "se-ease": 2.5 } });
	for (const spacingAlgorithm of ["Custom", "typo", undefined]) {
		await harness.plugin.updateInterval(harness.file, {}, 5, TIMESTAMP, defaultSpacingMethod({ spacingAlgorithm }));
	}
	assert.equal(harness.notices.filter(n => n === FALLBACK_NOTICE).length, 1);
	assert.equal(harness.notices.filter(n => n.startsWith("Interval updated")).length, 3);
});
