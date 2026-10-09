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

test("empty and partially numeric scores are refused", async () => {
	// Behavior change (#36): Number parsing requires a complete finite value, preventing accidental NaN or truncated scores.
	for (const typed of ["", " ", "2abc"]) {
		const { harness, option, score } = renderScore(defaultSpacingMethod());
		const before = option.score;
		await score.change(typed);
		assert.equal(option.score, before);
		assert.equal(harness.saves(), 0);
		assert.deepEqual(harness.notices, [RANGE_NOTICE]);
	}
});

test("Custom methods accept finite scores outside 0-5", async () => {
	// Behavior change (#36): custom scripts interpret scores using their own policy.
	const { harness, option, score } = renderScore(defaultSpacingMethod({ spacingAlgorithm: "Custom" }));
	await score.change("25");
	assert.equal(option.score, 25);
	assert.equal(harness.saves(), 1);
	assert.deepEqual(harness.notices, []);
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

test("the dropdown offers SuperMemo and Custom, and the script box is enabled", () => {
	const { dropdown, scriptBox, visibility } = renderMethod(defaultSpacingMethod());

	assert.deepEqual(dropdown.options, { "SuperMemo2.0": "SuperMemo 2.0", Custom: "Custom script" });
	assert.equal(dropdown.value, "SuperMemo2.0");
	// Behavior change (#36): scripts are implemented, so users can enter a path.
	assert.equal(scriptBox.disabled, false);
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

	// Behavior change (#36): block switching until scores meet SuperMemo's range, avoiding incompatible saved settings.
	method.reviewOptions[0].score = 25;
	await dropdown.change("SuperMemo2.0");
	assert.equal(method.spacingAlgorithm, "Custom");
	assert.equal(dropdown.value, "Custom");
	assert.equal(method.reviewOptions[0].score, 25);
	assert.deepEqual(visibility(), { customScript: "block", defaultEase: "none" });
	assert.equal(harness.saves(), 1);
	assert.deepEqual(harness.notices, ["Correct all review scores to numbers from 0 to 5 before switching to SuperMemo 2.0."]);

	method.reviewOptions[0].score = 5;
	await dropdown.change("SuperMemo2.0");
	assert.equal(method.spacingAlgorithm, "SuperMemo2.0");
	assert.deepEqual(visibility(), { customScript: "none", defaultEase: "block" });
	assert.equal(harness.saves(), 2);
});
