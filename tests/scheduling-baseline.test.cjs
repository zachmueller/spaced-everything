/**
 * Golden vectors for the SuperMemo 2.0 interval calculation, as shipped today.
 *
 * This is a characterization suite, not a specification: the numbers below were
 * recorded from the current implementation, so they lock in the behavior users
 * have — including the parts that deviate from textbook SM-2. A refactor that is
 * meant to preserve behavior must leave every one of them unchanged. If a change
 * is *intended*, updating a vector here is the deliberate record of it.
 *
 * The calculation lives inside `updateInterval()` in src/main.ts, so the tests
 * drive it through that method rather than through a narrower helper. Going in by
 * the public method means these vectors keep working if the arithmetic is later
 * extracted, which is exactly the property a behavior-preserving refactor needs.
 *
 * The formula, in the order the code applies it:
 *   adjustment  = 0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)
 *   newEase     = max(1.3, round4(prevEase + adjustment))
 *   newInterval = round4(max(1, prevInterval * newEase))
 *   newInterval = 1                                        when score < 3
 *
 * Two ordering details are load-bearing and easy to "fix" by accident:
 *   1. The interval is multiplied by the *new* ease, not the previous one. So a
 *      7-day interval at ease 2.5 with score 5 becomes 7 x 2.6 = 18.2, not 17.5.
 *   2. The ease is rounded and floored *before* that multiplication, so rounding
 *      error propagates into the interval rather than being applied afterwards.
 */

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { createPluginHarness } = require("./helpers/harness.cjs");

/**
 * Run one review against a note with the given prior scheduling state.
 *
 * The spacing-method defaults are set to values that would be obviously wrong if
 * they leaked into the result, so a vector can only pass by reading the note's
 * own `se-interval` and `se-ease`.
 */
async function review(prevInterval, prevEase, score) {
	const harness = createPluginHarness({
		frontmatter: { "se-interval": prevInterval, "se-ease": prevEase },
	});
	const method = { spacingAlgorithm: "SuperMemo2.0", defaultInterval: 999, defaultEaseFactor: 9.99 };

	return harness.plugin.updateInterval(harness.file, {}, score, "2026-01-01T00:00:00Z", method);
}

/**
 * prevInterval, prevEase, score -> newInterval, newEase.
 *
 * Recorded from src/main.ts. Blank lines group the grid by (interval, ease) and
 * carry no meaning.
 */
const GOLDEN_VECTORS = `
	1        1.3      0  1        1.3
	1        1.3      1  1        1.3
	1        1.3      2  1        1.3
	1        1.3      3  1.3      1.3
	1        1.3      4  1.3      1.3
	1        1.3      5  1.4      1.4

	1        1.5      0  1        1.3
	1        1.5      1  1        1.3
	1        1.5      2  1        1.3
	1        1.5      3  1.36     1.36
	1        1.5      4  1.5      1.5
	1        1.5      5  1.6      1.6

	1        2.5      0  1        1.7
	1        2.5      1  1        1.96
	1        2.5      2  1        2.18
	1        2.5      3  2.36     2.36
	1        2.5      4  2.5      2.5
	1        2.5      5  2.6      2.6

	1        2.34567  0  1        1.5457
	1        2.34567  1  1        1.8057
	1        2.34567  2  1        2.0257
	1        2.34567  3  2.2057   2.2057
	1        2.34567  4  2.3457   2.3457
	1        2.34567  5  2.4457   2.4457

	7        1.3      0  1        1.3
	7        1.3      1  1        1.3
	7        1.3      2  1        1.3
	7        1.3      3  9.1      1.3
	7        1.3      4  9.1      1.3
	7        1.3      5  9.8      1.4

	7        1.5      0  1        1.3
	7        1.5      1  1        1.3
	7        1.5      2  1        1.3
	7        1.5      3  9.52     1.36
	7        1.5      4  10.5     1.5
	7        1.5      5  11.2     1.6

	7        2.5      0  1        1.7
	7        2.5      1  1        1.96
	7        2.5      2  1        2.18
	7        2.5      3  16.52    2.36
	7        2.5      4  17.5     2.5
	7        2.5      5  18.2     2.6

	7        2.34567  0  1        1.5457
	7        2.34567  1  1        1.8057
	7        2.34567  2  1        2.0257
	7        2.34567  3  15.4399  2.2057
	7        2.34567  4  16.4199  2.3457
	7        2.34567  5  17.1199  2.4457

	30       1.3      0  1        1.3
	30       1.3      1  1        1.3
	30       1.3      2  1        1.3
	30       1.3      3  39       1.3
	30       1.3      4  39       1.3
	30       1.3      5  42       1.4

	30       1.5      0  1        1.3
	30       1.5      1  1        1.3
	30       1.5      2  1        1.3
	30       1.5      3  40.8     1.36
	30       1.5      4  45       1.5
	30       1.5      5  48       1.6

	30       2.5      0  1        1.7
	30       2.5      1  1        1.96
	30       2.5      2  1        2.18
	30       2.5      3  70.8     2.36
	30       2.5      4  75       2.5
	30       2.5      5  78       2.6

	30       2.34567  0  1        1.5457
	30       2.34567  1  1        1.8057
	30       2.34567  2  1        2.0257
	30       2.34567  3  66.171   2.2057
	30       2.34567  4  70.371   2.3457
	30       2.34567  5  73.371   2.4457

	1.23456  1.3      0  1        1.3
	1.23456  1.3      1  1        1.3
	1.23456  1.3      2  1        1.3
	1.23456  1.3      3  1.6049   1.3
	1.23456  1.3      4  1.6049   1.3
	1.23456  1.3      5  1.7284   1.4

	1.23456  1.5      0  1        1.3
	1.23456  1.5      1  1        1.3
	1.23456  1.5      2  1        1.3
	1.23456  1.5      3  1.679    1.36
	1.23456  1.5      4  1.8518   1.5
	1.23456  1.5      5  1.9753   1.6

	1.23456  2.5      0  1        1.7
	1.23456  2.5      1  1        1.96
	1.23456  2.5      2  1        2.18
	1.23456  2.5      3  2.9136   2.36
	1.23456  2.5      4  3.0864   2.5
	1.23456  2.5      5  3.2099   2.6

	1.23456  2.34567  0  1        1.5457
	1.23456  2.34567  1  1        1.8057
	1.23456  2.34567  2  1        2.0257
	1.23456  2.34567  3  2.7231   2.2057
	1.23456  2.34567  4  2.8959   2.3457
	1.23456  2.34567  5  3.0194   2.4457
`;

const vectors = GOLDEN_VECTORS.trim()
	.split("\n")
	.map((line) => line.trim())
	.filter(Boolean)
	.map((line) => line.split(/\s+/).map(Number));

test("golden vectors: every (interval, ease, score) combination is unchanged", async () => {
	assert.equal(vectors.length, 96, "the vector table lost or gained rows");

	for (const [prevInterval, prevEase, score, newInterval, newEase] of vectors) {
		const result = await review(prevInterval, prevEase, score);

		assert.deepEqual(
			result,
			{ newInterval, newEaseFactor: newEase },
			`interval ${prevInterval}, ease ${prevEase}, score ${score}`,
		);
	}
});

test("the interval uses the newly adjusted ease, not the previous one", async () => {
	// Textbook SM-2 multiplies by the ease in force *before* this review, which
	// would give 7 x 2.5 = 17.5. This implementation adjusts ease first.
	assert.deepEqual(await review(7, 2.5, 5), { newInterval: 18.2, newEaseFactor: 2.6 });
	assert.deepEqual(await review(7, 2.5, 3), { newInterval: 16.52, newEaseFactor: 2.36 });

	// Score 4 is the fixed point: the adjustment is exactly 0, so both readings
	// agree and this case cannot distinguish them.
	assert.deepEqual(await review(7, 2.5, 4), { newInterval: 17.5, newEaseFactor: 2.5 });
});

test("ease is floored at 1.3, and the floor feeds into the interval", async () => {
	// prevEase 1.35 with score 3 wants 1.21; the floor lifts it to 1.3, and the
	// interval is then 10 x 1.3 rather than 10 x 1.21.
	assert.deepEqual(await review(10, 1.35, 3), { newInterval: 13, newEaseFactor: 1.3 });

	// Already at the floor: successful reviews below score 5 cannot push it lower.
	assert.deepEqual(await review(10, 1.3, 3), { newInterval: 13, newEaseFactor: 1.3 });

	// The floor does not protect the interval. A low score still resets to 1 day.
	assert.deepEqual(await review(10, 1.3, 0), { newInterval: 1, newEaseFactor: 1.3 });
});

test("interval is floored at 1 day", async () => {
	// A sub-day interval times a small ease is still below 1.
	assert.deepEqual(await review(0.5, 1.3, 3), { newInterval: 1, newEaseFactor: 1.3 });
	assert.deepEqual(await review(0.1, 3, 5), { newInterval: 1, newEaseFactor: 3.1 });
});

test("scores below 3 reset the interval to 1 but still lower the ease", async () => {
	for (const score of [0, 1, 2]) {
		const { newInterval, newEaseFactor } = await review(365, 2.5, score);
		assert.equal(newInterval, 1, `score ${score} must reset the interval`);
		assert.ok(newEaseFactor < 2.5, `score ${score} must lower the ease`);
	}
});

test("both outputs are rounded to 4 decimal places", async () => {
	const { newInterval, newEaseFactor } = await review(1.23456789, 2.3456789, 5);

	assert.equal(newInterval, 3.0194);
	assert.equal(newEaseFactor, 2.4457);
	assert.equal(String(newInterval).split(".")[1].length, 4);
	assert.equal(String(newEaseFactor).split(".")[1].length, 4);
});

test("scores outside 0-5 are neither rejected nor clamped", async () => {
	// Not an endorsement — a record that no validation exists. The settings UI is
	// the only thing keeping scores in range, and it accepts any number.
	assert.deepEqual(await review(7, 2.5, 6), { newInterval: 18.62, newEaseFactor: 2.66 });

	// The ease adjustment is a downward parabola in (5 - score) with roots at
	// score 4 and score 10, so score 10 lands back on "no change" and anything
	// above it *reduces* ease again. Nothing in the code notices.
	assert.deepEqual(await review(7, 2.5, 10), { newInterval: 17.5, newEaseFactor: 2.5 });
	assert.deepEqual(await review(7, 2.5, 20), { newInterval: 9.1, newEaseFactor: 1.3 });

	// Negative scores fall below 3, so the interval resets; the ease drops hard.
	assert.deepEqual(await review(7, 2.5, -1), { newInterval: 1, newEaseFactor: 1.4 });
	assert.deepEqual(await review(7, 2.5, -10), { newInterval: 1, newEaseFactor: 1.3 });
});

test("a non-numeric score is rejected before persistence", async () => {
	await assert.rejects(review(7, 2.5, Number.NaN), /finite review score/);
});
