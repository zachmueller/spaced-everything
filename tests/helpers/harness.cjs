/**
 * Headless test harness: load `src/*.ts` and drive the plugin without Obsidian.
 *
 * There is no Obsidian runtime outside the app, so these tests bundle the
 * TypeScript in memory with esbuild (already a devDependency, used by the real
 * build) and substitute a minimal `obsidian` module. Nothing is written to disk
 * and no generated test files are needed.
 *
 * This complements `e2e/`, which drives the real app. Use these tests to pin
 * pure logic and call contracts cheaply; use the e2e suite to prove the plugin
 * actually works inside Obsidian.
 *
 * The `obsidian` stand-ins only need to be *constructible*: `src/` declares
 * classes that extend `Plugin`, `SuggestModal`, `Modal` and `PluginSettingTab`
 * at module scope, so those base classes are evaluated the moment the bundle
 * loads, whether or not a test touches them.
 */

const path = require("node:path");
const { buildSync } = require("esbuild");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

/** Compiled bundles, keyed by entry point. esbuild is slow enough to be worth caching. */
const bundleCache = new Map();

/**
 * Bundle a TypeScript entry point to CommonJS source text.
 *
 * `platform: "node"` and `format: "cjs"` match how the plugin ships (see
 * esbuild.config.mjs), so the module semantics tests observe are the shipped
 * ones — in particular non-strict CJS, which the `suggester()` helper depends on
 * (it reads `this.app`, where `this` is the global object at runtime).
 */
function bundle(entry) {
	if (!bundleCache.has(entry)) {
		const result = buildSync({
			entryPoints: [path.join(PROJECT_ROOT, entry)],
			bundle: true,
			write: false,
			platform: "node",
			format: "cjs",
			target: "es2018",
			external: ["obsidian", "electron"],
		});
		bundleCache.set(entry, result.outputFiles[0].text);
	}
	return bundleCache.get(entry);
}

/**
 * Evaluate a bundled entry point with `require` calls resolved against `mocks`.
 *
 * @param {string} entry - Repo-relative entry point, e.g. `"src/main.ts"`.
 * @param {Record<string, unknown>} mocks - Module id → replacement module.
 * @returns {Record<string, any>} The entry point's exports.
 */
function loadModule(entry, mocks = {}) {
	const text = bundle(entry);
	const module = { exports: {} };
	const requireShim = (id) =>
		Object.prototype.hasOwnProperty.call(mocks, id) ? mocks[id] : require(id);

	// eslint-disable-next-line no-new-func
	new Function("require", "module", "exports", text)(requireShim, module, module.exports);

	return module.exports;
}

/**
 * A stand-in for the `obsidian` module.
 *
 * `notices` collects every `new Notice(...)` message in order, which is how the
 * tests assert on user-facing feedback.
 */
function createObsidianMock() {
	const notices = [];

	class Notice {
		constructor(message) {
			this.message = message;
			notices.push(String(message));
		}
		hide() {}
	}

	class Stub {
		constructor(...args) {
			this.args = args;
		}
	}

	class Modal extends Stub {
		open() {}
		close() {}
	}

	/**
	 * A suggester that nothing has been told how to answer throws.
	 *
	 * The alternative — leaving `open()` a no-op — means `suggester()` never
	 * settles and `node --test` hangs indefinitely, since it applies no default
	 * timeout. Throwing surfaces the same mistake as a named test failure. The
	 * throw escapes the `new Promise` executor in `suggester()`, so it rejects the
	 * awaited promise and propagates to the caller.
	 *
	 * Tests that expect a prompt replace this via `harness.answerSuggester()`.
	 */
	class SuggestModal extends Stub {
		open() {
			SuggestModal.onOpen(this);
		}
		close() {}
	}
	SuggestModal.onOpen = (modal) => {
		throw new Error(
			`Unexpected suggester prompt ${JSON.stringify(modal.promptText)} with items ` +
			`${JSON.stringify(modal.items)}. Call harness.answerSuggester(...) to answer it.`,
		);
	};

	class Setting {
		constructor() {
			// Every configuration method returns `this` so settings.ts can chain.
			return new Proxy(this, { get: () => () => this });
		}
	}

	const obsidian = {
		App: Stub,
		Editor: Stub,
		MarkdownView: Stub,
		Modal,
		Notice,
		Plugin: Stub,
		PluginSettingTab: Stub,
		Setting,
		SuggestModal,
		TAbstractFile: Stub,
		TFile: Stub,
		TFolder: Stub,
		normalizePath: (p) => p,
	};

	return { obsidian, notices, SuggestModal };
}

/** DEFAULT_SETTINGS is not exported from src/main.ts, so mirror the parts tests need. */
function defaultSpacingMethod(overrides = {}) {
	return {
		name: "SuperMemo 2.0 (Simplified)",
		spacingAlgorithm: "SuperMemo2.0",
		customScriptFileName: "",
		reviewOptions: [
			{ name: "Fruitful", score: 1 },
			{ name: "Ignore", score: 3 },
			{ name: "Unfruitful", score: 5 },
		],
		defaultInterval: 1,
		defaultEaseFactor: 2.5,
		...overrides,
	};
}

function defaultSettings(overrides = {}) {
	return {
		logFilePath: "",
		logOnboardAction: true,
		logRemoveAction: true,
		logNoteTitle: true,
		logFrontMatterProperties: [],
		contexts: [],
		spacingMethods: [defaultSpacingMethod()],
		capturedThoughtTitleTemplate: "Inbox {{unixtime}}",
		capturedThoughtDirectory: "",
		capturedThoughtNoteTemplate: "## Captured thought\n{{thought}}",
		includeShortThoughtInAlias: true,
		shortCapturedThoughtThreshold: 200,
		openCapturedThoughtInNewTab: false,
		onboardingExcludedFolders: [],
		timestampTimeZone: "UTC",
		...overrides,
	};
}

/**
 * Build a plugin instance wired to recording doubles.
 *
 * The plugin is constructed without running `onload()`: these tests exercise
 * individual methods, so registering commands and settings tabs would only add
 * Obsidian surface to fake. Collaborators the methods under test reach for
 * (`app`, `settings`, `logger`, `frontmatterQueue`) are supplied directly.
 *
 * The recorder is installed as `plugin.frontmatterQueue`, not by overriding
 * `queueFrontmatterUpdate()`. That keeps the real queue-facing methods in play and
 * covers the paths that skip them: `toggleNoteContexts()` and `createNewNoteFile()`
 * call `this.frontmatterQueue.add()` directly.
 *
 * @param {object} [options]
 * @param {Record<string, unknown>} [options.frontmatter]
 *   Starting frontmatter for the note under test, as `processFrontMatter` would
 *   hand it to a callback. Mutations the plugin makes are visible afterwards on
 *   `harness.frontmatter`, which is how tests detect direct writes.
 * @param {Record<string, unknown>} [options.settings] - Merged over the defaults.
 * @param {string} [options.notePath]
 * @param {boolean} [options.applyQueue]
 *   Make each flush apply the updates queued since the previous one to
 *   `harness.frontmatter`, as FrontmatterQueue does. `harness.frontmatter` then
 *   shows the note as it ends up, however the plugin chose to write it. Tests of
 *   the resulting state should use this rather than asserting on `queued`.
 * @param {boolean} [options.realQueue]
 *   Install the real FrontmatterQueue from src/frontmatterQueue.ts instead of the
 *   recorder, for tests that depend on its per-file merge. `queued` and
 *   `processedQueue` are still recorded. Implies `applyQueue`.
 * @returns {object} The harness: `plugin`, `file`, `frontmatter`, `notices`,
 *   `queued`, `logs`, `processedQueue`, and `answerSuggester()`.
 */
function createPluginHarness({
	frontmatter = {},
	settings = {},
	notePath = "Note.md",
	applyQueue = false,
	realQueue = false,
} = {}) {
	const { obsidian, notices, SuggestModal } = createObsidianMock();
	const { default: SpacedEverythingPlugin } = loadModule("src/main.ts", { obsidian });

	const plugin = new SpacedEverythingPlugin();
	// The real queue only writes to `instanceof TFile` files, so the note must be one.
	const file = Object.assign(realQueue ? new obsidian.TFile() : {}, {
		path: notePath,
		basename: notePath.replace(/\.md$/, ""),
		extension: "md",
	});
	const noteFrontmatter = { ...frontmatter };

	/** Every `queueFrontmatterUpdate` call, in order. */
	const queued = [];
	/** Every `logger.log` call, in order, as an argument array. */
	const logs = [];
	/** One entry per `processFrontmatterQueue()` call: the queue as it was flushed. */
	const processedQueue = [];

	plugin.settings = defaultSettings(settings);

	plugin.app = {
		workspace: { getActiveFile: () => file },
		metadataCache: { getFileCache: () => ({ frontmatter: noteFrontmatter }) },
		fileManager: {
			processFrontMatter: async (target, callback) => {
				if (target !== file) throw new Error(`processFrontMatter called with ${target?.path}`);
				await callback(noteFrontmatter);
			},
		},
		vault: {
			getMarkdownFiles: () => [file],
			getAbstractFileByPath: (p) => (p === file.path ? file : null),
		},
	};

	// `suggester()` reads `this.app`, which is the global object under CJS.
	globalThis.app = plugin.app;

	plugin.logger = { log: (...args) => logs.push(args) };

	// Stand in for FrontmatterQueue itself, so plugin.queueFrontmatterUpdate() and
	// plugin.processFrontmatterQueue() run for real and the call sites that reach
	// past them are covered too.
	plugin.frontmatterQueue = {
		add: (target, updates) => {
			queued.push({ file: target, updates });
		},
		process: async () => {
			processedQueue.push(queued.map((entry) => entry.updates));
		},
	};

	// Loading and saving plugin data, for loadSettings() and saveSettings().
	plugin.savedData = [];
	plugin.loadData = async () => null;
	plugin.saveData = async (data) => {
		plugin.savedData.push(JSON.parse(JSON.stringify(data)));
	};

	/** Index into `queued` of the first update not yet flushed. */
	let flushed = 0;

	if (realQueue) {
		const { FrontmatterQueue } = loadModule("src/frontmatterQueue.ts", { obsidian });
		const queue = new FrontmatterQueue(plugin.app);
		plugin.frontmatterQueue = {
			add: (target, updates) => {
				queued.push({ file: target, updates });
				queue.add(target, updates);
			},
			process: async () => {
				processedQueue.push(queued.map((entry) => entry.updates));
				flushed = queued.length;
				await queue.process();
			},
		};
	} else if (applyQueue) {
		plugin.frontmatterQueue.process = async () => {
			processedQueue.push(queued.map((entry) => entry.updates));
			for (const { updates } of queued.slice(flushed)) {
				for (const [key, value] of Object.entries(updates)) {
					if (value === undefined) delete noteFrontmatter[key];
					else noteFrontmatter[key] = value;
				}
			}
			flushed = queued.length;
		};
	}

	/** One entry per suggester opened: `{ promptText, items }`. */
	const prompts = [];

	return {
		plugin,
		file,
		notices,
		queued,
		logs,
		processedQueue,
		prompts,
		/** The live frontmatter object; unchanged unless the plugin wrote to it directly. */
		frontmatter: noteFrontmatter,
		/**
		 * Answer the next suggester prompt(s) with `choices`, in order.
		 *
		 * Every prompt that opens is appended to `harness.prompts`, so a test can
		 * assert on what the user was offered as well as what they picked.
		 *
		 * `null` answers as if the user pressed Escape. Running out of answers throws,
		 * as does a prompt opened without calling this at all, so an unexpected extra
		 * prompt fails loudly instead of hanging the runner.
		 */
		answerSuggester(...choices) {
			const remaining = [...choices];
			SuggestModal.onOpen = (modal) => {
				prompts.push({ promptText: modal.promptText, items: modal.items });
				if (remaining.length === 0) {
					throw new Error(`Unexpected suggester prompt with items ${JSON.stringify(modal.items)}`);
				}
				// Resolve asynchronously: the real modal never calls back synchronously
				// from open(), and main.ts awaits the promise.
				const choice = remaining.shift();
				setImmediate(() => modal.onChooseItem(choice));
			};
		},
	};
}

module.exports = {
	PROJECT_ROOT,
	bundle,
	loadModule,
	createObsidianMock,
	createPluginHarness,
	defaultSettings,
	defaultSpacingMethod,
};
