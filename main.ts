import { App, Editor, MarkdownView, TFile, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, normalizePath } from 'obsidian';
import { Logger } from './logger';

interface Context {
	name: string;
	isActive: boolean;
	spacingMethodName: string;
}

interface ReviewOption {
	name: string;
	score: number;
}

interface SpacingMethod {
	name: string;
	spacingAlgorithm: string;
	customScriptFileName: string;
	reviewOptions: ReviewOption[];
	defaultInterval: number;
	defaultEaseFactor?: number; // optional because may only be relevant to SM-2
}

interface SpacedEverythingPluginSettings {
	logFilePath: string;
	logOnboardAction: boolean;
	logRemoveAction: boolean;
	logNoteTitle: boolean;
	logFrontMatterProperties: string[];
	contexts: Context[];
	spacingMethods: SpacingMethod[];
	// TODO::add things related to "capture thought" functionality::
}

const DEFAULT_SETTINGS: SpacedEverythingPluginSettings = {
	logFilePath: "", // defaults to no logging
	logOnboardAction: true,
	logRemoveAction: true,
	logNoteTitle: true,
	logFrontMatterProperties: [],
	contexts: [],
	spacingMethods: [
		{
			name: "SuperMemo 2.0 (Simplified)",
			spacingAlgorithm: "SuperMemo2.0",
			customScriptFileName: "",
			reviewOptions: [
				{ name: 'Fruitful', score: 1 },
				{ name: 'Ignore', score: 3 },
				{ name: 'Unfruitful', score: 5 },
			],
			defaultInterval: 1,
			defaultEaseFactor: 2.5,
		},
	],
}

class Suggester extends SuggestModal<string> {
	promptText: string;
	items: string[];
	onChooseItem: (item: string) => void;

	constructor(app: App, promptText: string, items: string[]) {
		super(app);
		this.promptText = promptText;
		this.items = items;
		this.onChooseItem = () => {};
	}

	getSuggestions(query: string): string[] {
		return this.items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
	}

	renderSuggestion(item: string, el: HTMLElement) {
		el.createEl("div", { text: item });
	}

	onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
		this.onChooseItem(item);
	}
}

export type { SpacedEverythingPluginSettings };

export default class SpacedEverythingPlugin extends Plugin {
	settings: SpacedEverythingPluginSettings;
	logger: Logger;

	async onload() {
		await this.loadSettings();
		this.logger = new Logger(this.app, this.settings);
		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SpacedEverythingSettingTab(this.app, this));
		
		// Command to log the review outcome
		this.addCommand({
			id: 'log-review-outcome',
			name: 'Log review outcome',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.logReviewOutcome(editor, view);
			}
		});
		
		// Command to open the next review item
		this.addCommand({
			id: 'open-next-review-item',
			name: 'Open next review item',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.openNextReviewItem(editor, view)
			}
		});

		// Add a new command to toggle contexts for a note
		this.addCommand({
			id: 'toggle-note-contexts',
			name: 'Toggle note contexts',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.toggleNoteContexts(editor, view)
			}
		});
	}

	async toggleNoteContexts(editor?: Editor, view?: MarkdownView) {
		const activeFile = this.app.workspace.getActiveFile()
		if (!activeFile) {
			new Notice("No active file to toggle contexts.");
			return;
		}

		const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		const currentContexts = frontmatter && frontmatter["se-contexts"] ? frontmatter["se-contexts"] : [];

		const choices = this.settings.contexts.map(context => {
			const isSelected = currentContexts.includes(context.name);
			return `${isSelected ? '☑' : '☐'} ${context.name}`;
		});

		const selectedChoice = await this.suggester(choices, "Select contexts for this note:");

		if (selectedChoice) {
			const selectedContext = selectedChoice.replace(/(?:☑|☐)\s/, '');
			const updatedContexts = currentContexts.filter((context: string) => context !== selectedContext);

			if (!currentContexts.includes(selectedContext)) {
				updatedContexts.push(selectedContext);
			}

			await this.app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
				frontmatter["se-contexts"] = updatedContexts;
			});
		}
	}

	async logReviewOutcome(editor: Editor, view: MarkdownView) {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file to review.');
			return;
		}

		// capture current timestamp
		const now = new Date().toISOString().split('.')[0];

		// check whether note already onboarded to Spaced Everything
		const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		const noteOnboarded = await this.isNoteOnboarded(activeFile, frontmatter);

		if (noteOnboarded) {
			const activeSpacingMethod = this.getActiveSpacingMethod(activeFile, frontmatter);
			if (!activeSpacingMethod) {
				new Notice('Error: No active spacing method found for this note.');
				return;
			}

			const reviewOptions = [...activeSpacingMethod.reviewOptions.map((option) => option.name), 'Remove'];
			const reviewResult = await this.suggester(reviewOptions, 'Select review outcome:');

			if (!reviewResult) {
				// exit if user presses Esc on the suggester
				new Notice('Spaced Everything review cancelled by user');
				return;
			}

			if (reviewResult === 'Remove') {
				await this.removeNoteFromSpacedEverything(activeFile, frontmatter);
			} else {
				const selectedOption = activeSpacingMethod.reviewOptions.find((option) => option.name === reviewResult);
				
				// check whether valid option selected
				if (!selectedOption) {
					new Notice('Error: Review option not found in settings. Please check your settings.');
					return;
				}
				
				// check whether valid review quality score set for 
				if (selectedOption.score === undefined || selectedOption.score === null) {
					new Notice(`Error: Review option score is not set in settings. Please set a score for the selected review option: ${selectedOption.name}`);
					return;
				}
				
				// perform action to update the interval
				const { newInterval, newEaseFactor } = await this.updateInterval(activeFile, frontmatter, selectedOption.score, now);
			}
		} else {
			await this.onboardNoteToSpacedEverything(activeFile, frontmatter);
		}
	}

	private filterNotesByContext(files: TFile[]): TFile[] {
		const activeContexts = this.settings.contexts.filter(context => context.isActive).map(context => context.name);

		// Case 1: No defined at all contexts
		if (this.settings.contexts.length === 0) {
			// If no contexts are defined or all are inactive, return all files
			return files;
		}

		// Case 2: All contexts are inactive
		if (this.settings.contexts.length > 0 && activeContexts.length === 0) {
			// If all contexts are defined but none are active, return no files
			new Notice('Spaced everything: No active contexts');
			return [];
		}

		return files.filter(file => {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
			const noteContexts = frontmatter?.['se-contexts'] || [];

			// Case 3: If noteContexts is empty, always include
			if (noteContexts.length === 0) {
				return true;
			}

			// Case 4: Some contexts are active
			const hasActiveContext = noteContexts.some((noteContext: string) => activeContexts.includes(noteContext));

			// If any of the note's contexts match the active contexts, include it
			return hasActiveContext;
		});
	}

	// Function to open the next item in the review queue
	async openNextReviewItem(editor: Editor, view: MarkdownView) {
		const vault = this.app.vault;
		const files = vault.getMarkdownFiles();
		
		// Filter notes based on the review criteria
		const filteredPages = this.filterNotesByContext(files)
			.filter(file => {
				const metadata = this.app.metadataCache.getFileCache(file)?.frontmatter;
				if (!metadata || metadata["se-interval"] === undefined) return false;

				const currentTime = Date.now();
				const timeDiff = metadata["se-interval"] * 24 * 60 * 60 * 1000;
				const lastReviewed = metadata["se-last-reviewed"]
					? new Date(metadata["se-last-reviewed"]).getTime()
					: 0;

				const isDue = currentTime > (lastReviewed + timeDiff);

				return isDue;
			})
			.sort((a, b) => {
				const aMetadata = this.app.metadataCache.getFileCache(a)?.frontmatter;
				const bMetadata = this.app.metadataCache.getFileCache(b)?.frontmatter;

				const aLastReviewed = aMetadata?.["se-last-reviewed"]
					? new Date(aMetadata["se-last-reviewed"]).getTime()
					: 0;
				const bLastReviewed = bMetadata?.["se-last-reviewed"]
					? new Date(bMetadata["se-last-reviewed"]).getTime()
					: 0;

				const aInterval = aMetadata?.["se-interval"] * 24 * 60 * 60 * 1000;
				const bInterval = bMetadata?.["se-interval"] * 24 * 60 * 60 * 1000;

				const aDueTime = aLastReviewed + (aInterval || 0);
				const bDueTime = bLastReviewed + (bInterval || 0);

				return aDueTime - bDueTime;
			});

		// Open the first due note in the queue
		if (filteredPages.length === 0) {
			new Notice("No notes to review, enjoy some fresh air!");
		} else {
			const file = filteredPages[0];
			const leaf = this.app.workspace.getLeaf(false); // false = open in the current tab
			leaf.openFile(file);
		}
	}

	async suggester(options: string[], promptText: string): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new Suggester(this.app, promptText, options);
			modal.onChooseItem = resolve;
			modal.open();
		});
	}

	async selectContext(validContexts: string[]): Promise<string | null> {
		const promptText = "Select a context for this note:";
		return this.suggester(validContexts, promptText);
	}

	async isNoteOnboarded(file: TFile, frontmatter: any): Promise<boolean> {
		return Object.keys(frontmatter || {}).includes('se-interval');
	}

	async onboardNoteToSpacedEverything(file: TFile, frontmatter: any): Promise<boolean> {
		const now = new Date().toISOString().split('.')[0];
		
		// prompt user to select contexts
		await this.toggleNoteContexts();
		
		const activeSpacingMethod = this.getActiveSpacingMethod(file, frontmatter);

		// add standard Spaced Everything frontmatter properties and values
		await this.app.fileManager.processFrontMatter(file, async (frontmatter: any) => {
			frontmatter["se-interval"] = activeSpacingMethod?.defaultInterval || 1;
			frontmatter["se-last-reviewed"] = now;
			frontmatter["se-ease"] = activeSpacingMethod?.defaultEaseFactor; // TODO::make sure this is optional
		});
		
		if (this.settings.logOnboardAction) {
			this.logger.log('onboarded', file, frontmatter);
		}
		
		new Notice(`Onboarded note to Spaced Everything: ${file.basename}`);
		return true;
	}

	async removeNoteFromSpacedEverything(file: TFile, frontmatter: any): Promise<void> {
		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			delete frontmatter['se-interval'];
			delete frontmatter['se-ease'];
			delete frontmatter['se-last-reviewed'];
			delete frontmatter['se-contexts'];
		});
		new Notice(`Removed note from Spaced Everything: ${file.basename}`);
		if (this.settings.logRemoveAction) {
			this.logger.log('removed', file, frontmatter);
		}
	}

	async updateInterval(file: TFile, frontmatter: any, reviewScore: number, now: string): Promise<{ newInterval: number; newEaseFactor: number; }> {
		let prevInterval = 1;
		let prevEaseFactor = 2.5;
		let newInterval = 0;
		let newEaseFactor = 0;

		const activeSpacingMethod = this.getActiveSpacingMethod(file, frontmatter);

		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			// Get the previous interval and ease factor from the frontmatter
			prevInterval = Number(frontmatter['se-interval'] || activeSpacingMethod?.defaultInterval || 1);
			prevEaseFactor = Number(frontmatter['se-ease'] || activeSpacingMethod?.defaultEaseFactor || 2.5);

			// Calculate the new ease factor based on the review score
			newEaseFactor = prevEaseFactor + (0.1 - (5 - reviewScore) * (0.08 + (5 - reviewScore) * 0.02));
			newEaseFactor = Math.max(1.3, parseFloat(newEaseFactor.toFixed(4)));

			// Calculate the new interval using the SuperMemo 2.0 formula
			newInterval = Math.max(1, prevInterval * newEaseFactor);
			newInterval = parseFloat(newInterval.toFixed(4));

			// Override interval to 1 day if the review score less than 3
			if (reviewScore < 3) {
				newInterval = 1;
			}

			// Update the frontmatter with the new interval and ease factor
			frontmatter['se-interval'] = newInterval;
			frontmatter['se-ease'] = newEaseFactor;
			frontmatter['se-last-reviewed'] = now;

			if (this.settings.logFilePath) {
				this.logger.log('review', file, frontmatter, reviewScore, newInterval, newEaseFactor);
			}
		});

		// Notify the user of the interval change
		new Notice(`Interval updated from ${prevInterval} to ${newInterval}`);

		return { newInterval, newEaseFactor };
	}

	getActiveSpacingMethod(file: TFile, frontmatter: any): SpacingMethod | undefined {
		const noteContexts = frontmatter?.['se-contexts'] || [];

		// If no contexts are defined for the note, use the first spacing method
		if (noteContexts.length === 0) {
			return this.settings.spacingMethods[0];
		}

		// Find the first context that matches an active context in the settings
		const activeContext = this.settings.contexts.find(
			(context) => context.isActive && noteContexts.includes(context.name)
		);

		// If no active context is found, use the first spacing method
		if (!activeContext) {
			return this.settings.spacingMethods[0];
		}

		// Use the spacing method associated with the active context
		const spacingMethodName = activeContext.spacingMethodName;
		return this.settings.spacingMethods.find((method) => method.name === spacingMethodName);
	}

	onunload() {
		
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SpacedEverythingSettingTab extends PluginSettingTab {
	plugin: SpacedEverythingPlugin;

	constructor(app: App, plugin: SpacedEverythingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl).setName('Spacing Methods').setHeading();
		const spacingMethodsSettingDiv = containerEl.createDiv();
		const spacingMethodsDiv = containerEl.createDiv();
		const addSpacingMethodDiv = containerEl.createDiv();

		new Setting(spacingMethodsSettingDiv)
			.setDesc('Define and manage the spacing methods you want to use for your spaced everything practice. You can create multiple spacing methods and map them to different contexts.');

		this.plugin.settings.spacingMethods.forEach((spacingMethod, index) => {
			this.renderSpacingMethodSetting(spacingMethodsDiv, spacingMethod, index);
		});

		new Setting(addSpacingMethodDiv)
			.addButton((button) =>
				button
				.setButtonText('+')
				.setIcon('plus')
				.onClick(async () => {
					const newSpacingMethod: SpacingMethod = {
						name: '',
						spacingAlgorithm: 'SuperMemo2.0',
						customScriptFileName: '',
						reviewOptions: [],
						defaultInterval: 1,
						defaultEaseFactor: 2.5,
					};
					this.plugin.settings.spacingMethods.push(newSpacingMethod);
					await this.plugin.saveSettings();
					this.renderSpacingMethodSetting(spacingMethodsDiv, newSpacingMethod, this.plugin.settings.spacingMethods.length - 1);
				})
			);

		// review contexts
		new Setting(containerEl).setName('Contexts').setHeading();
		const contextsSettingDiv = containerEl.createDiv();
		const addContextDiv = containerEl.createDiv();
		const contextsDiv = containerEl.createDiv();

		// Add button to create a new context
		new Setting(contextsSettingDiv)
			.setDesc('Define and manage the contexts you want to use for categorizing notes in your spaced everything practice. You can toggle the active state of each context to control which notes will be included in the review queue. Note: leaving this empty will ignore the use of contexts in the review system (i.e., all notes onboarded to Spaced Everything are in scope for reviews).')
		
		// Render existing contexts
		this.plugin.settings.contexts.forEach((context, index) => {
			this.renderContextSetting(contextsDiv, context, index);
		});

		new Setting(addContextDiv)
			// TODO::make this render in a better location to make it
			// more clearly distinct from review options expansion::
			.addButton((button) =>
				button
				.setButtonText('+')
				.setIcon('plus')
				.onClick(async () => {
					const newContext: Context = {
						name: '',
						isActive: false,
						spacingMethodName: this.plugin.settings.spacingMethods[0].name, // Set the default spacing method name
					};
					this.plugin.settings.contexts.push(newContext);
					await this.plugin.saveSettings();
					this.renderContextSetting(contextsDiv, newContext, this.plugin.settings.contexts.length - 1);
				})
			);

		// logging
		new Setting(containerEl).setName('Logging').setHeading();
		
		new Setting(containerEl)
			.setName('Log spaced everything practice activity')
			.setDesc('Choose the file path where Spaced Everything logs are stored. Leave blank to not capture logs. Note: output data format is JSONL (i.e., `.jsonl` file format recommended).')
			.addText(text => text
				.setValue(this.plugin.settings.logFilePath)
				.onChange(async (value) => {
					const normalizedPath = normalizePath(value);
					this.plugin.settings.logFilePath = normalizedPath;
					await this.plugin.saveSettings();
				})
			);
		
		new Setting(containerEl)
			.setName('Log action: note onboarded to Spaced Everything')
			.setDesc('Whether to log the action of onboarding a new note to Spaced Everything')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.logOnboardAction)
				.onChange(async (value) => {
					this.plugin.settings.logOnboardAction = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Log action: note removed from Spaced Everything')
			.setDesc('Whether to log the action of removing a note from Spaced Everything')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.logRemoveAction)
				.onChange(async (value) => {
					this.plugin.settings.logRemoveAction = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Log note title')
			.setDesc('Whether to include the note title in the log')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.logNoteTitle)
				.onChange(async (value) => {
					this.plugin.settings.logNoteTitle = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Log frontmatter properties')
			.setDesc('Provide a list (one per line) of frontmatter properties you would like to include in the Spaced Everything logs')
			// TODO::enable input to "select all" frontmatter properties::
			.addTextArea(textArea => {
				const properties = this.plugin.settings.logFrontMatterProperties ?? [];
				const propertyStr = properties.join('\n');
				textArea
				.setPlaceholder('Enter frontmatter properties, one per line')
				.setValue(propertyStr)
				.onChange(async (value) => {
					const properties = value.trim().split('\n').filter(property => property.trim() !== '');
					this.plugin.settings.logFrontMatterProperties = properties;
					await this.plugin.saveSettings();
				});
			});
	}

	renderSpacingMethodSetting(containerEl: HTMLElement, spacingMethod: SpacingMethod, index: number) {
		const settingEl = containerEl.createDiv('spacing-method-settings-items');
		const settingHeader = settingEl.createDiv('spacing-method-header');
		const settingBody = settingEl.createDiv('spacing-method-body');

		new Setting(settingHeader)
			.setName(`Spacing Method - #${index + 1}`)
			.setDesc('Configure the settings for this spacing method.');

		const generalSettingsDiv = settingBody.createDiv('general-settings');
		
		new Setting(generalSettingsDiv)
			.setName('Name')
			.setDesc('Enter a name for this spacing method')
			.addText((text) =>
				text
				.setPlaceholder('Name')
				.setValue(spacingMethod.name)
				.onChange(async (value) => {
					// TODO::ensure this does not get left blank (leads to confusing 
					// settings dropdown for contexts below if so)::
					spacingMethod.name = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(generalSettingsDiv)
			.setName('Default interval')
			.setDesc('The default interval length, in days')
			.addText((text) =>
				text
				.setPlaceholder('Default interval')
				.setValue(spacingMethod.defaultInterval.toString())
				.onChange(async (value) => {
					const numericValue = parseFloat(value);
					if (!isNaN(numericValue)) {
						spacingMethod.defaultInterval = numericValue;
						await this.plugin.saveSettings();
					} else {
						new Notice('Default Interval must be a number.');
					}
				})
			);

		new Setting(generalSettingsDiv)
			.setName('Spacing algorithm')
			.setDesc('Select which spacing algorithm approach to apply')
			.addDropdown((dropdown) =>
				dropdown
				.addOptions({
					'SuperMemo2.0': 'SuperMemo 2.0',
					'Custom': 'Custom Script',
				})
				.setValue(spacingMethod.spacingAlgorithm)
				.onChange(async (value) => {
					spacingMethod.spacingAlgorithm = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(generalSettingsDiv)
			.setName('Custom script')
			.setDesc('>>>NOT YET IMPLEMENTED<<< —— Input the location of your custom script file that implements a spacing algorithm')
			// TODO::hide unless 'Custom Script' option set above::
			.addText((text) =>
				text
				.setPlaceholder('Custom Script File Name')
				.setValue(spacingMethod.customScriptFileName)
				.onChange(async (value) => {
					// TODO::implement helper stuff for auto-completing paths/filenames::
					spacingMethod.customScriptFileName = value;
					await this.plugin.saveSettings();
				})
				.setDisabled(spacingMethod.spacingAlgorithm !== 'Custom')
			)

		new Setting(generalSettingsDiv)
			.setName('Default ease factor')
			.setDesc('The default ease factor')
			// TODO::hide unless SuperMemo 2.0 algorithm set above::
			.addText((text) =>
				text
				.setPlaceholder('Default ease factor')
				.setValue(spacingMethod.defaultEaseFactor?.toString() || '')
				.onChange(async (value) => {
					const numericValue = parseFloat(value);
					if (!isNaN(numericValue)) {
						spacingMethod.defaultEaseFactor = numericValue;
						await this.plugin.saveSettings();
					} else {
						new Notice('Default Ease Factor must be a number.');
					}
				})
				.setDisabled(spacingMethod.spacingAlgorithm !== 'SuperMemo2.0')
			);

		// Render review options for the spacing method
		const reviewOptionsDiv = settingBody.createDiv('review-options');
		new Setting(reviewOptionsDiv)
			.setHeading()
			.setName('Review Options')
			.setDesc('Customize the review options and scores to use in this spacing method. For the SuperMemo-2.0 spacing algorithm, review scores must be a number from 0 to 5.');

		const addReviewOptionDiv = reviewOptionsDiv.createDiv();
		new Setting(addReviewOptionDiv)
			.addButton((button) =>
				button
				.setButtonText('+')
				.setIcon('plus')
				.setTooltip('Add a new review option')
				.onClick(async () => {
					const newOption = { name: '', score: 0 };
					spacingMethod.reviewOptions.push(newOption);
					await this.plugin.saveSettings();
					this.renderReviewOptionSetting(reviewOptionsDiv, newOption, spacingMethod.reviewOptions.length - 1, index);
				})
			);

		spacingMethod.reviewOptions.forEach((option, optionIndex) => {
			this.renderReviewOptionSetting(reviewOptionsDiv, option, optionIndex, index);
		});

		// Add delete button for the spacing method
		new Setting(settingEl)
			// TODO::make this render in a better location to make it
			// more clearly distinct from review options expansion::
			.addExtraButton((cb) => {
				cb.setIcon('cross')
				.setTooltip('Delete')
				.onClick(async () => {
					this.plugin.settings.spacingMethods.splice(index, 1);
					await this.plugin.saveSettings();
					this.display(); // Re-render the settings tab
				});
			});
	}

	renderContextSetting(containerEl: HTMLElement, context: Context, index: number) {
		const settingEl = containerEl.createDiv('context-settings-items');

		new Setting(settingEl)
			.setName(`(${index + 1})`)
			.addText((text) =>
				text
				.setValue(context.name)
				.onChange(async (value) => {
					context.name = value;
					await this.plugin.saveSettings();
				})
			)
			.addToggle((toggle) =>
				toggle
				.setValue(context.isActive)
				.onChange(async (value) => {
					context.isActive = value;
					await this.plugin.saveSettings();
				})
			)
			.addDropdown((dropdown) =>
				dropdown
				.addOptions(Object.fromEntries(
					this.plugin.settings.spacingMethods.map((method) => [method.name, method.name])
				))
				.setValue(context.spacingMethodName)
				.onChange(async (value) => {
					context.spacingMethodName = value;
					await this.plugin.saveSettings();
				})
			)
			.addExtraButton((cb) => {
				cb.setIcon('cross')
				.setTooltip('Delete')
				.onClick(async () => {
					this.plugin.settings.contexts.splice(index, 1);
					await this.plugin.saveSettings();
					this.display(); // Re-render the settings tab
				});
			});
	}

	renderReviewOptionSetting(containerEl: HTMLElement, option: ReviewOption, optionIndex: number, spacingMethodIndex: number) {
		const settingEl = containerEl.createDiv('review-option-settings-items');

		new Setting(settingEl)
			.setName(`(${optionIndex + 1})`)
			.addText((text) =>
				text
				.setPlaceholder('Name')
				.setValue(option.name)
				.onChange(async (value) => {
					option.name = value;
					await this.plugin.saveSettings();
				})
			)
			.addText((text) =>
				text
				.setPlaceholder('Review score')
				.setValue(option.score.toString())
				.onChange(async (value) => {
					const numericValue = parseFloat(value);
					if (value === '' || (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 5)) {
						option.score = numericValue;
						await this.plugin.saveSettings();
					} else {
						new Notice('Review score must be a number from 0 to 5');
					}
				})
			)
			.addExtraButton((cb) => {
				cb.setIcon('cross')
				.setTooltip('Delete')
				.onClick(async () => {
					this.plugin.settings.spacingMethods[spacingMethodIndex].reviewOptions.splice(optionIndex, 1);
					await this.plugin.saveSettings();
					this.display(); // Re-render the settings tab
				});
			});
	}
}
