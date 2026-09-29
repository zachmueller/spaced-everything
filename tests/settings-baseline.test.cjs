/**
 * The spacing-method settings UI in src/settings.ts, as shipped today.
 *
 * These pin what the settings tab accepts and saves: how a review score typed
 * into the box is parsed and range-checked, and what the algorithm dropdown does.
 * Scores saved here are what updateInterval() later receives, so a parsing change
 * is a scheduling change for every user who edits their options.
 *
 * The tab is driven through tests/helpers/settings-harness.cjs, which records
 * each rendered Setting so a test can fire a control's onChange as a user would.
 */

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { defaultSpacingMethod } = require("./helpers/harness.cjs");
const { createSettingsHarness } = require("./helpers/settings-harness.cjs");

const RANGE_NOTICE = "Review score must be a number from 0 to 5";

/** Render one review option and return its score text box. */
function renderScore(method) {
	const harness = createSettingsHarness({ spacingMethods: [method] });
	const option = method.reviewOptions[0];
	harness.tab.renderReviewOptionSetting(harness.createElement(), option, 0, 0);
	return { harness, option, score: harness.find("(1)").texts[1] };
}

test("a review score from 0 to 5 is saved as a number", async () => {
	for (const [typed, stored] of [["0", 0], ["5", 5], ["2.5", 2.5], [" 3", 3]]) {
		const { harness, option, score } = renderScore(defaultSpacingMethod());

		await score.change(typed);

		assert.equal(option.score, stored, `typing ${JSON.stringify(typed)}`);
		assert.equal(harness.saves(), 1);
		assert.deepEqual(harness.notices, []);
	}
});

test("a review score outside 0-5, or not a number, is refused with a notice", async () => {
	for (const typed of ["6", "-1", "abc", "5.01"]) {
		const { harness, option, score } = renderScore(defaultSpacingMethod());
		const before = option.score;

		await score.change(typed);

		assert.equal(option.score, before, `typing ${JSON.stringify(typed)} must not change the score`);
		assert.equal(harness.saves(), 0);
		assert.deepEqual(harness.notices, [RANGE_NOTICE]);
	}
});

test("an empty score box saves NaN, and a numeric prefix is saved as its number", async () => {
	// Recorded, not endorsed. The check is `value === '' || parseFloat in range`,
	// so clearing the box stores parseFloat('') = NaN, which JSON saves as null
	// (logReviewOutcome then refuses that option as unscored). parseFloat also
	// reads a leading number and drops the rest, so '2abc' saves 2.
	const empty = renderScore(defaultSpacingMethod());
	await empty.score.change("");
	assert.ok(Number.isNaN(empty.option.score));
	assert.equal(empty.harness.saves(), 1);

	const prefix = renderScore(defaultSpacingMethod());
	await prefix.score.change("2abc");
	assert.equal(prefix.option.score, 2);
	assert.equal(prefix.harness.saves(), 1);
});

test("the 0-5 range applies whatever the method's algorithm is", async () => {
	const { harness, option, score } = renderScore(defaultSpacingMethod({ spacingAlgorithm: "Custom" }));

	await score.change("25");

	assert.equal(option.score, 1, "the Fruitful default is kept");
	assert.deepEqual(harness.notices, [RANGE_NOTICE]);
});

/** Render a whole spacing method and return the controls these tests use. */
function renderMethod(method) {
	const harness = createSettingsHarness({ spacingMethods: [method] });
	harness.tab.renderSpacingMethodSetting(harness.createElement(), method, 0);
	const customScript = harness.find("Custom script");
	const ease = harness.find("Default ease factor");
	return {
		harness,
		dropdown: harness.find("Spacing algorithm").dropdown,
		scriptBox: customScript.texts[0],
		visibility: () => ({
			customScript: customScript.containerEl.style.display,
			defaultEase: ease.containerEl.style.display,
		}),
	};
}

test("the dropdown offers SuperMemo and Custom, and the script box is disabled", () => {
	const { dropdown, scriptBox, visibility } = renderMethod(defaultSpacingMethod());

	assert.deepEqual(dropdown.options, { "SuperMemo2.0": "SuperMemo 2.0", Custom: "Custom script" });
	assert.equal(dropdown.value, "SuperMemo2.0");
	assert.equal(scriptBox.disabled, true, "custom scripts are not implemented");
	assert.deepEqual(visibility(), { customScript: "none", defaultEase: "block" });
});

test("a method saved as Custom renders with the script box shown and ease hidden", () => {
	const { dropdown, visibility } = renderMethod(defaultSpacingMethod({ spacingAlgorithm: "Custom" }));

	assert.equal(dropdown.value, "Custom");
	assert.deepEqual(visibility(), { customScript: "block", defaultEase: "none" });
});

test("switching algorithms saves the choice and swaps which fields are shown", async () => {
	const method = defaultSpacingMethod();
	const { harness, dropdown, visibility } = renderMethod(method);

	await dropdown.change("Custom");
	assert.equal(method.spacingAlgorithm, "Custom");
	assert.deepEqual(visibility(), { customScript: "block", defaultEase: "none" });

	// Recorded, not endorsed: switching to SuperMemo checks nothing, so scores a
	// hand-edited data.json put out of range are kept and fed to SuperMemo.
	method.reviewOptions[0].score = 25;
	await dropdown.change("SuperMemo2.0");
	assert.equal(method.spacingAlgorithm, "SuperMemo2.0");
	assert.equal(method.reviewOptions[0].score, 25);
	assert.deepEqual(visibility(), { customScript: "none", defaultEase: "block" });

	assert.equal(harness.saves(), 2);
	assert.deepEqual(harness.notices, []);
});
