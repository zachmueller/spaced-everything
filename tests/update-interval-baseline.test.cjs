/**
 * The call contract of `updateInterval()` in src/main.ts, as shipped today.
 *
 * Companion to scheduling-baseline.test.cjs: that file pins the arithmetic, this
 * one pins everything around it — where the prior scheduling state is read from,
 * how missing values are resolved, what gets queued rather than written, what the
 * user is told, and when the log line is emitted.
 *
 * Both files exist to make behavior-preserving refactors of this method
 * checkable. Anything asserted here is current behavior, including the parts that
 * look like bugs; those are called out in comments rather than fixed, because a
 * test that quietly encodes a wish is worse than no test.
 */

const { test } = require("node:test");
const assert = require("node:assert/strict");

const { createPluginHarness } = require("./helpers/harness.cjs");

/** A spacing method whose defaults are distinguishable from the hardcoded ones. */
// Behavior change (#36): pass an explicit method to select the scheduler.
const METHOD = { name: "Test method", spacingAlgorithm: "SuperMemo2.0", defaultInterval: 3, defaultEaseFactor: 2 };

const TIMESTAMP = "2026-01-01T12:00:00Z";

test("prior state comes from the file, not from the caller's frontmatter argument", async () => {
	// The callback parameter shadows the `frontmatter` argument, so the snapshot
	// the caller passes in is never read for scheduling. logReviewOutcome() hands
	// over a metadataCache snapshot that can be stale; this is why that does not
	// matter here.
	const harness = createPluginHarness({ frontmatter: { "se-interval": 7, "se-ease": 2.5 } });
	const staleSnapshot = { "se-interval": 999, "se-ease": 9.99 };

	const result = await harness.plugin.updateInterval(
		harness.file,
		staleSnapshot,
		4,
		TIMESTAMP,
		METHOD,
	);

	assert.deepEqual(result, { newInterval: 17.5, newEaseFactor: 2.5 });
});

test("missing values fall back to the spacing method's defaults, then to 1 and 2.5", async () => {
	const withMethod = createPluginHarness({ frontmatter: {} });
	assert.deepEqual(
		await withMethod.plugin.updateInterval(withMethod.file, {}, 4, TIMESTAMP, METHOD),
		{ newInterval: 6, newEaseFactor: 2 },
		"should use the method's 3 / 2.0",
	);

	const noMethod = createPluginHarness({ frontmatter: {} });
	assert.deepEqual(
		await noMethod.plugin.updateInterval(noMethod.file, {}, 4, TIMESTAMP, { spacingAlgorithm: "SuperMemo2.0" }),
		{ newInterval: 2.5, newEaseFactor: 2.5 },
		"should use the hardcoded 1 / 2.5 when method defaults are absent",
	);
});

test("falsy stored values fall back to defaults instead of being used", async () => {
	// `frontmatter['se-interval'] || default` treats 0 and "" as absent. A note
	// deliberately set to a zero interval therefore gets the default instead.
	// Recorded as current behavior; changing it is a behavior change, not a
	// refactor.
	for (const falsy of [0, "", null, false]) {
		const harness = createPluginHarness({
			frontmatter: { "se-interval": falsy, "se-ease": falsy },
		});

		assert.deepEqual(
			await harness.plugin.updateInterval(harness.file, {}, 4, TIMESTAMP, METHOD),
			{ newInterval: 6, newEaseFactor: 2 },
			`se-interval ${JSON.stringify(falsy)} should fall through to the default`,
		);
	}

	// The same applies one level down: zeroed method defaults fall through to 1 / 2.5.
	const zeroDefaults = createPluginHarness({ frontmatter: {} });
	assert.deepEqual(
		await zeroDefaults.plugin.updateInterval(zeroDefaults.file, {}, 4, TIMESTAMP, {
			spacingAlgorithm: "SuperMemo2.0",
			defaultInterval: 0,
			defaultEaseFactor: 0,
		}),
		{ newInterval: 2.5, newEaseFactor: 2.5 },
	);
});

test("numeric strings in frontmatter are coerced", async () => {
	// Hand-edited frontmatter, or a note synced from another tool, can quote these.
	const harness = createPluginHarness({ frontmatter: { "se-interval": "7", "se-ease": "2.5" } });

	assert.deepEqual(
		await harness.plugin.updateInterval(harness.file, {}, 5, TIMESTAMP, METHOD),
		{ newInterval: 18.2, newEaseFactor: 2.6 },
	);
});

// Behavior change (#36): Reject invalid state instead of persisting NaN so a bad note cannot corrupt its schedule.
test("non-numeric frontmatter is rejected without changing the note or reporting success", async () => {
	const initial = { "se-interval": "soon", "se-ease": "easy" };
	const harness = createPluginHarness({ frontmatter: initial });
	await assert.rejects(harness.plugin.updateInterval(harness.file, {}, 4, TIMESTAMP, METHOD), /positive finite/);
	assert.deepEqual(harness.frontmatter, initial);
	assert.deepEqual(harness.queued, []);
	assert.deepEqual(harness.notices, []);
	assert.deepEqual(harness.logs, []);
});

// Behavior change (#36): Persist and validate in one transaction; report success only after the write resolves.
test("the new schedule is persisted directly and only three keys are touched", async () => {
	const initial = { "se-interval": 7, "se-ease": 2.5, "se-method": "Test method", title: "keep" };
	const harness = createPluginHarness({ frontmatter: initial });
	await harness.plugin.updateInterval(harness.file, {}, 5, TIMESTAMP, METHOD);
	assert.deepEqual(harness.frontmatter, {
		...initial, "se-interval": 18.2, "se-ease": 2.6, "se-last-reviewed": TIMESTAMP,
	});
	assert.deepEqual(harness.queued, []);
	assert.deepEqual(harness.processedQueue, []);
});

test("the timestamp is stored verbatim, without reformatting", async () => {
	// formatTimestamp() already applied the timestampTimeZone setting; this method
	// must not second-guess it.
	const harness = createPluginHarness({ frontmatter: { "se-interval": 1, "se-ease": 2.5 } });
	const localTimestamp = "2026-01-01T12:00:00+13:00";

	await harness.plugin.updateInterval(harness.file, {}, 3, localTimestamp, METHOD);

	assert.equal(harness.frontmatter["se-last-reviewed"], localTimestamp);
});

test("the notice reports the resolved previous interval and the new one", async () => {
	const stored = createPluginHarness({ frontmatter: { "se-interval": 30, "se-ease": 2.5 } });
	await stored.plugin.updateInterval(stored.file, {}, 1, TIMESTAMP, METHOD);
	assert.deepEqual(stored.notices, ["Interval updated from 30 to 1"]);

	// When the stored value was absent, the notice shows the default that was used
	// rather than saying nothing was there.
	const defaulted = createPluginHarness({ frontmatter: {} });
	await defaulted.plugin.updateInterval(defaulted.file, {}, 5, TIMESTAMP, METHOD);
	assert.deepEqual(defaulted.notices, ["Interval updated from 3 to 6.3"]);
});

test("the review is logged only when a log file is configured", async () => {
	const off = createPluginHarness({
		frontmatter: { "se-interval": 7, "se-ease": 2.5 },
		settings: { logFilePath: "" },
	});
	await off.plugin.updateInterval(off.file, {}, 5, TIMESTAMP, METHOD);
	assert.deepEqual(off.logs, [], "no log call when logFilePath is empty");

	const on = createPluginHarness({
		frontmatter: { "se-interval": 7, "se-ease": 2.5 },
		settings: { logFilePath: "logs/reviews.jsonl" },
	});
	await on.plugin.updateInterval(on.file, {}, 5, TIMESTAMP, METHOD);

	assert.equal(on.logs.length, 1);
	const [action, file, loggedFrontmatter, score, interval, ease] = on.logs[0];
	assert.equal(action, "review");
	assert.equal(file, on.file);
	assert.equal(score, 5);
	assert.equal(interval, 18.2);
	assert.equal(ease, 2.6);

	// The log receives a snapshot of the note before the review.
	assert.deepEqual(loggedFrontmatter, { "se-interval": 7, "se-ease": 2.5 });
});

// Behavior change (#36): Log only after persistence so failed writes cannot produce successful review entries.
test("the log line is emitted after persistence and before the success notice", async () => {
	const harness = createPluginHarness({
		frontmatter: { "se-interval": 7, "se-ease": 2.5 },
		settings: { logFilePath: "logs/reviews.jsonl" },
	});
	const order = [];
	const persist = harness.plugin.app.fileManager.processFrontMatter;
	harness.plugin.app.fileManager.processFrontMatter = async (...args) => {
		await persist(...args);
		order.push("persist");
	};
	harness.plugin.logger = { log: () => {
		assert.equal(harness.frontmatter["se-interval"], 18.2);
		assert.deepEqual(harness.notices, []);
		order.push("log");
	} };
	await harness.plugin.updateInterval(harness.file, {}, 5, TIMESTAMP, METHOD);
	order.push(`notice:${harness.notices.length}`);
	assert.deepEqual(order, ["persist", "log", "notice:1"]);
});

test("the returned values are the ones persisted", async () => {
	// logReviewOutcome() currently ignores the return value, but it is part of the
	// method's signature and must stay consistent with what lands in the note.
	const harness = createPluginHarness({ frontmatter: { "se-interval": 7, "se-ease": 2.5 } });

	const result = await harness.plugin.updateInterval(harness.file, {}, 3, TIMESTAMP, METHOD);
	const updates = harness.frontmatter;

	assert.equal(result.newInterval, updates["se-interval"]);
	assert.equal(result.newEaseFactor, updates["se-ease"]);
});

test("invalid numeric state and overflow are rejected without saving", async () => {
	// Behavior change (#36): reject negative/non-finite inputs and overflow rather than saving a misleading schedule.
	for (const frontmatter of [
		{ "se-interval": -3, "se-ease": 2.5 },
		{ "se-interval": 7, "se-ease": -1 },
		{ "se-interval": 1e308, "se-ease": 2.5 },
		{ "se-interval": Infinity, "se-ease": 2.5 },
	]) {
		const harness = createPluginHarness({ frontmatter });
		await assert.rejects(harness.plugin.updateInterval(harness.file, {}, 5, TIMESTAMP, METHOD), /positive finite/);
		assert.deepEqual(harness.frontmatter, frontmatter);
		assert.deepEqual(harness.queued, []);
		assert.deepEqual(harness.notices, []);
		assert.deepEqual(harness.logs, []);
	}
});

test("a logging failure does not fail the review", async () => {
	// Logging errors are isolated from persistence and the success notice.
	// The real Logger also catches its own file errors.
	const harness = createPluginHarness({
		frontmatter: { "se-interval": 7, "se-ease": 2.5 },
		settings: { logFilePath: "logs/reviews.jsonl" },
		applyQueue: true,
	});
	harness.plugin.logger = {
		log: () => {
			const failed = Promise.reject(new Error("log volume unavailable"));
			failed.catch(() => {}); // handled here, so the runner sees no unhandled rejection
			return failed;
		},
	};

	const result = await harness.plugin.updateInterval(harness.file, {}, 5, TIMESTAMP, METHOD);
	await harness.plugin.processFrontmatterQueue();

	assert.deepEqual(result, { newInterval: 18.2, newEaseFactor: 2.6 });
	assert.equal(harness.frontmatter["se-interval"], 18.2);
	assert.equal(harness.frontmatter["se-ease"], 2.6);
	assert.deepEqual(harness.notices, ["Interval updated from 7 to 18.2"]);
});

test("a failing frontmatter read rejects before anything is queued, announced or logged", async () => {
	const harness = createPluginHarness({
		frontmatter: { "se-interval": 7, "se-ease": 2.5 },
		settings: { logFilePath: "logs/reviews.jsonl" },
	});
	harness.plugin.app.fileManager.processFrontMatter = async () => {
		throw new Error("file is locked");
	};

	await assert.rejects(
		harness.plugin.updateInterval(harness.file, {}, 5, TIMESTAMP, METHOD),
		/file is locked/,
	);
	assert.deepEqual(harness.queued, []);
	assert.deepEqual(harness.notices, []);
	assert.deepEqual(harness.logs, []);
});

test("through the command, a save failure shows a notice and skips the flush", async () => {
	// Behavior change (#36): catch save errors to give actionable feedback; leave the queue pending on failure.
	const harness = createPluginHarness({
		frontmatter: { "se-interval": 7, "se-ease": 2.5, "se-method": "Deleted method" },
	});
	harness.plugin.app.fileManager.processFrontMatter = async () => {
		throw new Error("file is locked");
	};
	harness.answerSuggester("Unfruitful");

	await harness.plugin.logReviewOutcome();
	assert.ok(harness.notices.includes("Review could not be saved: file is locked"));
	assert.deepEqual(harness.queued, [
		{ file: harness.file, updates: { "se-method": "SuperMemo 2.0 (Simplified)" } },
	]);
	assert.deepEqual(harness.processedQueue, []);
	assert.ok(!harness.notices.some((n) => n.startsWith("Interval updated")));
});
