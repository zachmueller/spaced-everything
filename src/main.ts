import { App, Editor, MarkdownView, TFile, Notice, Plugin, Modal } from 'obsidian';
import { Context, ReviewOption, SpacingMethod } from './types';
import { Logger } from './logger';
import { SpacedEverythingPluginSettings, SpacedEverythingSettingTab } from './settings';
import { Suggester, suggester } from './suggester';

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
	capturedThoughtTitleTemplate: "Inbox {{unixtime}}",
	capturedThoughtDirectory: "",
	capturedThoughtNoteTemplate: "## Captured thought\n{{thought}}",
	includeShortThoughtInAlias: true,
	shortCapturedThoughtThreshold: 200,
	openCapturedThoughtInNewTab: false,
}

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

		// Add a new command to capture thoughts
		this.addCommand({
			id: 'capture-thought',
			name: 'Capture thought',
			callback: () => {
				this.captureThought()
			}
		});
	}

	async captureThought() {
		// craft modal for collecting user input
		const modal = new Modal(this.app);
		modal.contentEl.createEl("h3", { text: "Capture thought" });

		// Create a container element to hold the variable names and commas
		const variableNamesContainer = modal.contentEl.createEl("span");

		// Create elements for each variable name wrapped in <code> tags
		const variableNameElements = [
		  variableNamesContainer.createEl("code", { text: "{{unixtime}}" }),
		  variableNamesContainer.createEl("span", { text: ", " }),
		  variableNamesContainer.createEl("code", { text: "{{date}}" }),
		  variableNamesContainer.createEl("span", { text: ", and " }),
		  variableNamesContainer.createEl("code", { text: "{{time}}" }),
		];

		variableNamesContainer.createEl("span", { text: `Write out your thought here. You have access to the following variables: ` });
		variableNameElements.forEach(el => variableNamesContainer.appendChild(el));

		modal.contentEl.createEl("br", {});
		modal.contentEl.createEl("br", {});

		const textArea = modal.contentEl.createEl("textarea");
		textArea.style.height = "100%";
		textArea.style.width = "100%";

		// add usage footnotes
		modal.contentEl.createEl("small", { text: "Shift + Enter for new lines." });
		modal.contentEl.createEl("br", {});
		modal.contentEl.createEl("small", { text: "Enter to submit." });

		const handleSubmit = async (thought: string | null): Promise<void> => {
			if (thought === null || thought === "") {
				new Notice("Cancelled by the user");
				return;
			}

			modal.close();

			const now = new Date();
			thought = this.processCapturedThoughtNewNoteContents(thought, now);
			const newNoteFile = await this.createNewNoteFile(thought, now);
			await this.openNewNote(newNoteFile);
			let aliases: string[] = [];
			await this.onboardNoteToSpacedEverything(newNoteFile, {});

			// TODO::need to refactor how I handle note frontmatter generally across the code base for maintainability::
			await this.app.fileManager.processFrontMatter(newNoteFile, async (frontmatter: any) => {
				frontmatter["se-capture-time"] = Math.floor(now.getTime() / 1000).toString();
				if (this.settings.includeShortThoughtInAlias && thought 
					&& thought.length <= this.settings.shortCapturedThoughtThreshold) {
					frontmatter["aliases"] = [thought];
				}
			});
		};

		textArea.addEventListener("keydown", (event) => {
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				handleSubmit(textArea.value || null);
			}
		});

		modal.open();
	}

	private processCapturedThoughtNewNoteContents(thought: string, now: Date): string {
		thought = thought.trim();
		thought = this.replaceCapturedThoughtVariables(thought, now);

		return thought;
	}

	private replaceCapturedThoughtVariables(content: string, now: Date): string {
		const unixTime = Math.floor(now.getTime() / 1000).toString();
		const dateString = now.toISOString().split("T")[0];
		const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		content = content.replace(/{{unixtime}}/g, unixTime.toString())
			.replace(/{{date}}/g, dateString)
			.replace(/{{time}}/g, timeString);

		return content;
	}

	async createNewNoteFile(thought: string, now: Date): Promise<TFile> {
		const noteTitle = this.replaceCapturedThoughtVariables(this.settings.capturedThoughtTitleTemplate, now);

		const noteDirectory = this.settings.capturedThoughtDirectory || "";
		const newNotePath = `${noteDirectory}/${noteTitle}.md`;

		const newNoteContent = this.settings.capturedThoughtNoteTemplate.replace(/{{thought}}/g, thought);

		const newNoteFile = await this.app.vault.create(newNotePath, newNoteContent);

		return newNoteFile;
	}

	async openNewNote(newNoteFile: TFile) {
		const { openCapturedThoughtInNewTab } = this.settings;

		if (openCapturedThoughtInNewTab) {
			await this.app.workspace.openLinkText(newNoteFile.path, newNoteFile.path, true, { active: true });
		} else {
			const leaf = this.app.workspace.getLeaf(true);
			await leaf.openFile(newNoteFile);
		}
	}

	async toggleNoteContexts(editor?: Editor, view?: MarkdownView) {
		if (this.settings.contexts.length === 0) {
			// no contexts to toggle
			new Notice('Spaced Everything: No contexts defined');
			return;
		}

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

		const selectedChoice = await suggester(choices, "Select contexts for this note:");

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
			const reviewResult = await suggester(reviewOptions, 'Select review outcome:');

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

	async selectContext(validContexts: string[]): Promise<string | null> {
		const promptText = "Select a context for this note:";
		return suggester(validContexts, promptText);
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
			frontmatter["se-ease"] = activeSpacingMethod?.defaultEaseFactor; // TODO::make sure this is optional::
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
