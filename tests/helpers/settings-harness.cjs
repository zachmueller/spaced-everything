/**
 * Headless harness for the settings tab (src/settings.ts).
 *
 * harness.cjs's `Setting` stand-in swallows every call, which is enough to load
 * the module but not to drive it. This one records what each setting renders, so
 * a test can find a control by the setting's name and fire its onChange handler
 * the way a user edit would.
 *
 * Unknown methods on a setting or control return `this`, like the real chainable
 * API, so rendering code the tests don't care about still runs.
 */

const { createObsidianMock, loadModule } = require("./harness.cjs");

/**
 * A fake HTMLElement: `createDiv`/`createEl` return children, and `style.display`
 * is where the settings tab toggles visibility.
 */
function createElement(cls) {
	const el = {
		cls,
		style: {},
		children: [],
		createDiv(childCls) {
			const child = createElement(childCls);
			el.children.push(child);
			return child;
		},
		createEl(tag, options) {
			const child = createElement(options?.cls);
			child.tag = tag;
			child.options = options;
			el.children.push(child);
			return child;
		},
		empty() {
			el.children.length = 0;
		},
	};
	return el;
}

/** A text box or dropdown: records its value, handler and disabled state. */
function createControl(kind) {
	const control = { kind, value: undefined, disabled: false, change: undefined };
	const proxy = new Proxy(control, {
		get: (obj, key) => {
			if (key === "setValue") return (v) => ((obj.value = v), proxy);
			if (key === "onChange") return (fn) => ((obj.change = fn), proxy);
			if (key === "setDisabled") return (d) => ((obj.disabled = d), proxy);
			if (key === "addOptions") return (o) => ((obj.options = o), proxy);
			if (key in obj) return obj[key];
			return () => proxy;
		},
	});
	return proxy;
}

/**
 * Load the settings tab with a recording `Setting`.
 *
 * @param {object} settings - The plugin settings object the tab edits in place.
 * @returns {object} `tab`, `settings` (every Setting rendered, in order),
 *   `notices`, `saves()` (count of saveSettings calls), `find(name)` and
 *   `createElement`.
 */
function createSettingsHarness(settings) {
	const { obsidian, notices } = createObsidianMock();
	const rendered = [];

	class Setting {
		constructor(containerEl) {
			const record = {
				containerEl,
				name: undefined,
				texts: [],
				dropdown: undefined,
				descEl: createElement("setting-item-description"),
			};
			rendered.push(record);
			const proxy = new Proxy(record, {
				get: (obj, key) => {
					if (key === "setName") return (n) => ((obj.name = n), proxy);
					if (key === "addText") {
						return (fn) => {
							const c = createControl("text");
							obj.texts.push(c);
							fn(c);
							return proxy;
						};
					}
					if (key === "addDropdown") {
						return (fn) => {
							obj.dropdown = createControl("dropdown");
							fn(obj.dropdown);
							return proxy;
						};
					}
					if (key in obj) return obj[key];
					return (fn) => {
						// addButton, addExtraButton, addToggle, ...: run the builder
						// against a throwaway control so the chain completes.
						if (typeof fn === "function") fn(createControl("other"));
						return proxy;
					};
				},
			});
			return proxy;
		}
	}

	const { SpacedEverythingSettingTab } = loadModule("src/settings.ts", {
		obsidian: { ...obsidian, Setting },
	});

	let saves = 0;
	const plugin = {
		settings,
		saveSettings: async () => {
			saves++;
		},
	};
	const tab = new SpacedEverythingSettingTab({}, plugin);
	tab.plugin = plugin; // the PluginSettingTab stub doesn't assign it
	tab.display = () => {}; // re-render requests are irrelevant here

	return {
		tab,
		plugin,
		settings: rendered,
		notices,
		saves: () => saves,
		/** The last rendered Setting with this name. */
		find: (name) => [...rendered].reverse().find((s) => s.name === name),
		createElement,
	};
}

module.exports = { createSettingsHarness };
