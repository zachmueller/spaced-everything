import { App, Editor, MarkdownView, TFile, Notice, Plugin, PluginSettingTab, Setting, SuggestModal, normalizePath } from 'obsidian';
import { Logger } from './logger';

interface Context {
	name: string;
	isActive: boolean;
}

interface ReviewOption {
	name: string;
	score: number;
}

interface SpacedWritingPracticePluginSettings {
	defaultInterval: number;
	defaultEaseFactor: number;
	logFilePath: string;
	logOnboardAction: boolean;
	logRemoveAction: boolean;
	logNoteTitle: boolean;
	logFrontMatterProperties: string[];
	contexts: Context[];
	reviewOptions: ReviewOption[];
}

const DEFAULT_SETTINGS: SpacedWritingPracticePluginSettings = {
	defaultInterval: 1,
	defaultEaseFactor: 2.5,
	logFilePath: "",
	logOnboardAction: true,
	logRemoveAction: true,
	logNoteTitle: true,
	logFrontMatterProperties: [],
	contexts: [],
	reviewOptions: [
		{ name: 'Fruitful', score: 1 },
		{ name: 'Ignore', score: 3 },
		{ name: 'Unfruitful', score: 5 },
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

export type { SpacedWritingPracticePluginSettings };

export default class SpacedWritingPracticePlugin extends Plugin {
	settings: SpacedWritingPracticePluginSettings;
	logger: Logger;

	async onload() {
		await this.loadSettings();
		this.logger = new Logger(this.app, this.settings);
		
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SpacedWritingPracticeSettingTab(this.app, this));
		
		// Command to log the review outcome
		this.addCommand({
			id: 'log-review-outcome',
			name: 'Log review outcome',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.logReviewOutcome(editor, view);
			}
		});
		
		// Command to open the next review note
		this.addCommand({
			id: 'open-next-review-note',
			name: 'Open next review note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.openNextReviewNote(editor, view)
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
		const currentContexts = frontmatter && frontmatter["swp-contexts"] ? frontmatter["swp-contexts"] : [];

		const choices = this.settings.contexts.map(context => {
			const isSelected = currentContexts.includes(context.name);
			return `${isSelected ? '[X]' : '[ ]'} ${context.name}`;
		});

		const selectedChoice = await this.suggester(choices, "Select contexts for this note:");

		if (selectedChoice) {
			const selectedContext = selectedChoice.replace(/\[(X|\s)\]\s/, '');
			const updatedContexts = currentContexts.filter((context: string) => context !== selectedContext);

			if (!currentContexts.includes(selectedContext)) {
				updatedContexts.push(selectedContext);
			}

			await this.app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
				frontmatter["swp-contexts"] = updatedContexts;
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

		// check whether note already onboarded to SWP
		const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		const noteOnboarded = await this.isNoteOnboarded(activeFile, frontmatter);

		if (noteOnboarded) {
			// collect review result
			const reviewOptions = [...this.settings.reviewOptions.map((option) => option.name), 'Remove'];
			const reviewResult = await this.suggester(reviewOptions, 'Select review outcome:');

			if (!reviewResult) {
				// exit if user presses Esc on the suggester
				new Notice('SWP review cancelled by user');
				return;
			}

			if (reviewResult === 'Remove') {
				await this.removeNoteFromSWP(activeFile, frontmatter);
			} else {
				const selectedOption = this.settings.reviewOptions.find((option) => option.name === reviewResult);
				
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
				const { newInterval, newEaseFactor } = await this.updateInterval(activeFile, frontmatter, selectedOption?.score ?? 0, now);
			}
		} else {
			await this.onboardNoteToSWP(activeFile, frontmatter);
		}
	}

	// Function to open the next note in the review queue
	async openNextReviewNote(editor: Editor, view: MarkdownView) {
		const vault = this.app.vault;
		const files = vault.getMarkdownFiles();
		
		// Filter notes based on the review criteria
		const filteredPages = files
			.filter(file => {
				const metadata = this.app.metadataCache.getFileCache(file)?.frontmatter;
				if (!metadata || metadata["swp-interval"] === undefined) return false;

				const currentTime = Date.now();
				const timeDiff = metadata["swp-interval"] * 24 * 60 * 60 * 1000;
				const lastReviewed = metadata["swp-last-reviewed"]
					? new Date(metadata["swp-last-reviewed"]).getTime()
					: 0;

				const isDue = currentTime > (lastReviewed + timeDiff);

				return isDue;
			})
			.sort((a, b) => {
				const aMetadata = this.app.metadataCache.getFileCache(a)?.frontmatter;
				const bMetadata = this.app.metadataCache.getFileCache(b)?.frontmatter;

				const aLastReviewed = aMetadata?.["swp-last-reviewed"]
					? new Date(aMetadata["swp-last-reviewed"]).getTime()
					: 0;
				const bLastReviewed = bMetadata?.["swp-last-reviewed"]
					? new Date(bMetadata["swp-last-reviewed"]).getTime()
					: 0;

				const aInterval = aMetadata?.["swp-interval"] * 24 * 60 * 60 * 1000;
				const bInterval = bMetadata?.["swp-interval"] * 24 * 60 * 60 * 1000;

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
		return Object.keys(frontmatter || {}).includes('swp-interval');
	}

	async onboardNoteToSWP(file: TFile, frontmatter: any): Promise<boolean> {
		const now = new Date().toISOString().split('.')[0];
		
		// prompt user to select contexts
		await this.toggleNoteContexts();
		
		// add standard SWP frontmatter properties and values
		await this.app.fileManager.processFrontMatter(file, async (frontmatter: any) => {
			frontmatter["swp-interval"] = this.settings.defaultInterval;
			frontmatter["swp-last-reviewed"] = now;
			frontmatter["swp-ease"] = this.settings.defaultEaseFactor;
		});
		
		if (this.settings.logOnboardAction) {
			this.logger.log('onboarded', file, frontmatter);
		}
		
		new Notice(`Onboarded note to SWP: ${file.basename}`);
		return true;
	}

	async removeNoteFromSWP(file: TFile, frontmatter: any): Promise<void> {
		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			delete frontmatter['swp-interval'];
			delete frontmatter['swp-ease'];
			delete frontmatter['swp-last-reviewed'];
			delete frontmatter['swp-contexts'];
		});
		new Notice(`Removed note from SWP: ${file.basename}`);
		if (this.settings.logRemoveAction) {
			this.logger.log('removed', file, frontmatter);
		}
	}

	async updateInterval(file: TFile, frontmatter: any, reviewScore: number, now: string): Promise<{ newInterval: number; newEaseFactor: number; }> {
		let prevInterval = this.settings.defaultInterval;
		let prevEaseFactor = this.settings.defaultEaseFactor;
		let newInterval = 0;
		let newEaseFactor = 0;

		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			// Get the previous interval and ease factor from the frontmatter
			prevInterval = Number(frontmatter['swp-interval'] || this.settings.defaultInterval);
			prevEaseFactor = Number(frontmatter['swp-ease'] || this.settings.defaultEaseFactor);

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
			frontmatter['swp-interval'] = newInterval;
			frontmatter['swp-ease'] = newEaseFactor;
			frontmatter['swp-last-reviewed'] = now;

			if (this.settings.logFilePath) {
				this.logger.log('review', file, frontmatter, reviewScore, newInterval, newEaseFactor);
			}
		});

		// Notify the user of the interval change
		new Notice(`Interval updated from ${prevInterval} to ${newInterval}`);

		return { newInterval, newEaseFactor };
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

class SpacedWritingPracticeSettingTab extends PluginSettingTab {
	plugin: SpacedWritingPracticePlugin;

	constructor(app: App, plugin: SpacedWritingPracticePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Default interval')
			.setDesc('The default interval length, in days')
			.addText(text => text
				.setValue(this.plugin.settings.defaultInterval.toString())
				.onChange(async (value) => {
					const numericValue = parseFloat(value);
					if (!isNaN(numericValue)) {
						this.plugin.settings.defaultInterval = numericValue;
						await this.plugin.saveSettings();
					} else {
						new Notice('Default Interval must be a number.');
					}
				})
			);

		new Setting(containerEl)
			.setName('Default ease factor')
			.setDesc('The default ease factor')
			.addText(text => text
				.setValue(this.plugin.settings.defaultEaseFactor.toString())
				.onChange(async (value) => {
					const numericValue = parseFloat(value);
					if (!isNaN(numericValue)) {
						this.plugin.settings.defaultEaseFactor = numericValue;
						await this.plugin.saveSettings();
					} else {
						new Notice('Default ease factor must be a number.');
					}
				})
			);

		// review options
		new Setting(containerEl).setName('Review options').setHeading();
		const reviewOptionsSettingDiv = containerEl.createDiv();
		const reviewOptionsDiv = containerEl.createDiv();
		const addReviewOptionsDiv = containerEl.createDiv();

		// Add button to create a new review option
		new Setting(reviewOptionsSettingDiv)
			.setDesc('Customize the review options and scores to use in your spaced writing practice. The numeric value sets the review score, following the SuperMemo-2.0 spacing algorithm. Review scores must be a number from 0 to 5.')

		// Render existing review options
		this.plugin.settings.reviewOptions.forEach((option, index) => {
			this.renderReviewOptionSetting(reviewOptionsDiv, option, index);
		});

		new Setting(addReviewOptionsDiv)
			.addButton((button) =>
				button
				.setButtonText('+')
				.setIcon('plus')
				.onClick(async () => {
					const newOption = { name: '', score: 0 };
					this.plugin.settings.reviewOptions.push(newOption);
					await this.plugin.saveSettings();
					this.renderReviewOptionSetting(reviewOptionsDiv, newOption, this.plugin.settings.reviewOptions.length - 1);
				})
			);

		// review contexts
		new Setting(containerEl).setName('Contexts').setHeading();
		const contextsSettingDiv = containerEl.createDiv();
		const contextsDiv = containerEl.createDiv();
		const addContextDiv = containerEl.createDiv();

		// Add button to create a new context
		new Setting(contextsSettingDiv)
			.setDesc('Define and manage the contexts you want to use for categorizing notes in your spaced writing practice. You can toggle the active state of each context to control which notes will be included in the review queue. Note: leaving this empty will ignore the use of contexts in the review system (i.e., all notes will be in scope for reviews).')
		
		// Render existing contexts
		this.plugin.settings.contexts.forEach((context, index) => {
			this.renderContextSetting(contextsDiv, context, index);
		});

		new Setting(addContextDiv)
			.addButton((button) =>
				button
				.setButtonText('+')
				.setIcon('plus')
				.onClick(async () => {
					const newContext = { name: '', isActive: false };
					this.plugin.settings.contexts.push(newContext);
					await this.plugin.saveSettings();
					this.renderContextSetting(contextsDiv, newContext, this.plugin.settings.contexts.length - 1);
				})
			);

		// logging
		new Setting(containerEl).setName('Logging').setHeading();
		
		new Setting(containerEl)
			.setName('Log spaced writing practice activity')
			.setDesc('Choose the file path where SWP logs are stored. Leave blank to not capture logs. Note: output data format is JSONL (i.e., `.jsonl` file format recommended).')
			.addText(text => text
				.setValue(this.plugin.settings.logFilePath)
				.onChange(async (value) => {
					const normalizedPath = normalizePath(value);
					this.plugin.settings.logFilePath = normalizedPath;
					await this.plugin.saveSettings();
				})
			);
		
		new Setting(containerEl)
			.setName('Log action: note onboarded to SWP')
			.setDesc('Whether to log the action of onboarding a new note to SWP')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.logOnboardAction)
				.onChange(async (value) => {
					this.plugin.settings.logOnboardAction = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Log action: note removed from SWP')
			.setDesc('Whether to log the action of removing a note from SWP')
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
			.setDesc('Provide a list (one per line) of frontmatter properties you would like to include in the SWP logs')
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
			.addExtraButton((cb) => {
				cb.setIcon("cross")
				.setTooltip("Delete")
				.onClick(async () => {
					this.plugin.settings.contexts.splice(index, 1);
					await this.plugin.saveSettings();
					this.display(); // Re-render the settings tab
				});
			});
	}

	renderReviewOptionSetting(containerEl: HTMLElement, option: ReviewOption, index: number) {
		const settingEl = containerEl.createDiv('review-option-settings-items');

		new Setting(settingEl)
			.setName(`(${index + 1})`)
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
					this.plugin.settings.reviewOptions.splice(index, 1);
					await this.plugin.saveSettings();
					this.display(); // Re-render the settings tab
				});
			});
	}
}
