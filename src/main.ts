import { App, Editor, MarkdownView, TFile, Notice, Plugin, Modal } from 'obsidian';
import { Context, ReviewOption, SpacingMethod } from './types';
import { Logger } from './logger';
import { SpacedEverythingPluginSettings, SpacedEverythingSettingTab } from './settings';
import { Suggester, suggester } from './suggester';
import { FrontmatterQueue } from './frontmatterQueue';

/**
 * SpacedEverythingPlugin - Main plugin orchestrator for spaced repetition in Obsidian
 * 
 * This is the primary entry point that coordinates all plugin functionality. It manages
 * the plugin lifecycle, registers user commands, handles settings persistence, and
 * orchestrates review workflows using the SuperMemo 2.0 spaced repetition algorithm.
 * 
 * The plugin implements a queue-based frontmatter update system to prevent race conditions
 * with Obsidian's file save events. When users edit files, Obsidian fires multiple save
 * events in rapid succession, which can corrupt frontmatter if updates are applied
 * immediately. The FrontmatterQueue batches and deduplicates updates before applying
 * them atomically.
 * 
 * Key Features:
 * - SuperMemo 2.0 algorithm for calculating optimal review intervals
 * - Context-based organization of notes into separate review queues
 * - Privacy-conscious logging of review activity
 * - Thought capture workflow for quick note creation
 * - Configurable spacing methods and review options
 * 
 * Key exports: SpacedEverythingPlugin class (default export)
 * Dependencies: Obsidian Plugin API, FrontmatterQueue for atomic updates, Logger for activity tracking
 * Integration: Extends Obsidian's Plugin class, uses MetadataCache for efficient file scanning
 */

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
	onboardingExcludedFolders: [],
	timestampTimeZone: "UTC",
}

/**
 * SpacedEverythingPlugin - Main plugin class for Obsidian spaced repetition
 * 
 * Coordinates all plugin functionality including command registration, settings management,
 * and review workflows. Implements the SuperMemo 2.0 algorithm to calculate optimal review
 * intervals based on user feedback (quality scores from 0-5).
 * 
 * Architecture:
 * - Uses FrontmatterQueue to batch and deduplicate frontmatter updates, preventing race
 *   conditions when Obsidian fires multiple save events during user edits
 * - Leverages MetadataCache for fast access to note frontmatter without file I/O
 * - Implements context-based filtering to organize notes into separate review queues
 * 
 * Plugin Lifecycle:
 * 1. onload() - Initializes logger, queue, registers commands and settings tab
 * 2. User triggers commands (review, capture thought, toggle contexts, etc.)
 * 3. Plugin scans vault and calculates which notes are due for review
 * 4. User reviews notes and provides quality scores
 * 5. Plugin updates intervals using SuperMemo 2.0 algorithm
 * 6. onunload() - Cleanup (minimal for this plugin)
 * 
 * Core User Workflows:
 * - Review workflow: User opens next due note, rates recall quality, interval updates automatically
 * - Onboarding: User adds existing notes to spaced repetition system with initial settings
 * - Context management: User organizes notes into separate queues (e.g., learning vs. reference)
 * - Thought capture: User quickly creates new notes with automatic onboarding
 * 
 * @example
 * ```typescript
 * // Plugin is instantiated automatically by Obsidian
 * // Users interact via registered commands:
 * // - "Spaced Everything: Open next item for review"
 * // - "Spaced Everything: Log review outcome"
 * // - "Spaced Everything: Toggle note contexts"
 * // - "Spaced Everything: Capture thought"
 * // - "Spaced Everything: Update spacing method"
 * ```
 */
export default class SpacedEverythingPlugin extends Plugin {
	settings: SpacedEverythingPluginSettings;
	logger: Logger;
	private frontmatterQueue: FrontmatterQueue;

	async onload() {
		await this.loadSettings();
		this.logger = new Logger(this.app, this.settings);
		this.frontmatterQueue = new FrontmatterQueue(this.app);

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

		// Command to toggle contexts for a note
		this.addCommand({
			id: 'toggle-note-contexts',
			name: 'Toggle note contexts',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.toggleNoteContextsWrapper(editor, view)
			}
		});

		// Command to capture thoughts
		this.addCommand({
			id: 'capture-thought',
			name: 'Capture thought',
			callback: () => {
				this.captureThought()
			}
		});

		// Command to update the spacing method for a note
		this.addCommand({
			id: 'update-spacing-method',
			name: 'Update spacing method',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.updateSpacingMethod(editor, view);
			}
		});
	}

    // Helper method to add updates to the queue
    queueFrontmatterUpdate(file: TFile, updates: Record<string, any>) {
        this.frontmatterQueue.add(file, updates);
    }

    // Helper method to process all queued updates
    async processFrontmatterQueue() {
        await this.frontmatterQueue.process();
    }

	// Helper method to format timestamps with time zone info
	private formatTimestamp(date: Date): string {
		switch (this.settings.timestampTimeZone) {
			case "Local":
				// Format as local time with timezone offset
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				const seconds = String(date.getSeconds()).padStart(2, '0');

				// Calculate timezone offset
				const tzOffset = -date.getTimezoneOffset();
				const offsetHours = Math.abs(Math.floor(tzOffset / 60)).toString().padStart(2, '0');
				const offsetMinutes = Math.abs(tzOffset % 60).toString().padStart(2, '0');
				const offsetSign = tzOffset >= 0 ? '+' : '-';

				return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;

			case "UTC":
			default:
				// For UTC, keep full ISO string but remove milliseconds
				return date.toISOString().replace(/\.\d{3}/, '');
		}
	}

	// Helper function to parse timestamps consistently. Necessary since
	// my original implementation left out time zone info but I later added
	// in functionality to write out timestamps in different time zones.
	private parseTimestamp(timestamp: string): Date {
		if (!timestamp) return new Date(0);

		// Check for timezone indicators that appear after the "T":
		// 1. Ends with Z
		// 2. Has a + or - after the T character
		if (/Z$|T.*[+-]/.test(timestamp)) {
			return new Date(timestamp);
		} else {
			// No timezone info - assume based on user setting:
			switch (this.settings.timestampTimeZone) {
				case "Local":
					return new Date(timestamp);
				case "UTC":
				default:
					return new Date(timestamp + "Z");
			}
		}
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

			await this.frontmatterQueue.add(newNoteFile, {
				"se-capture-time": Math.floor(now.getTime() / 1000).toString(),
				"aliases": this.settings.includeShortThoughtInAlias && thought
					&& thought.length <= this.settings.shortCapturedThoughtThreshold ? [thought] : undefined
			});
			await this.processFrontmatterQueue();
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

	private async generateUniqueFilePath(filename: string, extension: string = '.md'): Promise<string> {
		let uniqueFilename = `${filename}${extension}`;

		// return initial filename, if not already taken
		if (!(await this.app.vault.adapter.exists(uniqueFilename))) {
			return uniqueFilename;
		}

		// iteratively add counters until find available file path
		let counter = 1;
		while (true) {
			const filePath = `${filename}-${counter}${extension}`;
			const fileExists = await this.app.vault.adapter.exists(filePath);

			if (!fileExists) {
				return filePath;
			}

			uniqueFilename = `${filename} ${counter}`;
			counter++;
		}
	}

	async createNewNoteFile(thought: string, now: Date): Promise<TFile> {
		const noteTitle = this.replaceCapturedThoughtVariables(this.settings.capturedThoughtTitleTemplate, now);
		const noteDirectory = this.settings.capturedThoughtDirectory || "";
		const newNotePath = await this.generateUniqueFilePath(`${noteDirectory}/${noteTitle}`);

		const templateContent = this.settings.capturedThoughtNoteTemplate;
		const hasThoughtVariable = templateContent.includes("{{thought}}");

		let newNoteContent: string;

		if (hasThoughtVariable) {
			newNoteContent = templateContent.replace(/{{thought}}/g, thought);
		} else {
			newNoteContent = `${templateContent}\n\n---\n\n## Thought\n${thought}\n\n`;
			newNoteContent += 'Note: Your `Capture thought -> New note template` setting does not contain the `{{thought}}` variable, thus your captured thought was appended below your existing template. Please visit your Spaced Everything plugin settings to update the template and prevent this message from arising in the future.';
		}

		const newNoteFile = await this.app.vault.create(newNotePath, newNoteContent);

		return newNoteFile;
	}

	async openNewNote(newNoteFile: TFile) {
		const { openCapturedThoughtInNewTab } = this.settings;

		if (!openCapturedThoughtInNewTab) {
			const activeLeaf = this.app.workspace.activeLeaf;
			if (activeLeaf) {
				await activeLeaf.openFile(newNoteFile);
				return;
			} else {
				new Notice('No active editor, opened note in new tab');
			}
		}
		await this.app.workspace.openLinkText(newNoteFile.path, newNoteFile.path, true, { active: true });
	}

	async toggleNoteContextsWrapper(editor?: Editor, view?: MarkdownView) {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active file to toggle contexts.");
			return;
		}

		await this.toggleNoteContexts(activeFile);
		await this.processFrontmatterQueue();
	}

	async toggleNoteContexts(file: TFile) {
		if (this.settings.contexts.length === 0) {
			// no contexts to toggle
			new Notice('Spaced Everything: No contexts defined');
			return;
		}

		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
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

			await this.frontmatterQueue.add(file, {
				"se-contexts": updatedContexts
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
		const now = new Date();
		const nowFormatted = this.formatTimestamp(now);

		// check whether note already onboarded to Spaced Everything
		const frontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
		const noteOnboarded = await this.isNoteOnboarded(activeFile, frontmatter);

		if (noteOnboarded) {
			const activeSpacingMethod = await this.getActiveSpacingMethod(activeFile, frontmatter);
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
				const { newInterval, newEaseFactor } = await this.updateInterval(activeFile, frontmatter, selectedOption.score, nowFormatted, activeSpacingMethod);
			}
		} else {
			await this.onboardNoteToSpacedEverything(activeFile, frontmatter);
		}

		// Process all queued frontmatter updates
		await this.processFrontmatterQueue();
	}

	/**
	 * Filter notes by active contexts, handling edge cases for backward compatibility
	 * 
	 * Context filtering has several non-obvious edge cases designed to ensure users can
	 * always review notes, even if they haven't configured contexts yet or have temporarily
	 * deactivated all contexts. This prevents the frustrating situation where users
	 * accidentally lock themselves out of all reviews.
	 * 
	 * Edge Cases (in priority order):
	 * 1. No contexts defined in settings → Include all notes (user hasn't set up contexts yet)
	 * 2. All contexts inactive → Include no notes and show warning (intentional pause)
	 * 3. Note has no se-contexts property → Include note (backward compatibility for old notes)
	 * 4. Note has contexts AND some contexts active → Include if note matches ANY active context (OR logic)
	 * 
	 * The OR logic in case 4 means a note tagged with ['learning', 'reference'] will appear
	 * in reviews if EITHER 'learning' OR 'reference' is active, not requiring both.
	 * 
	 * @param files - Array of note files to filter
	 * @returns Filtered array of notes matching active contexts (or all notes in edge cases)
	 * 
	 * @example
	 * ```typescript
	 * // Case 1: No contexts configured → returns all notes
	 * settings.contexts = [];
	 * const filtered = filterNotesByContext(allNotes);
	 * // filtered === allNotes
	 * 
	 * // Case 2: All contexts inactive → returns empty array
	 * settings.contexts = [
	 *   { name: 'learning', isActive: false },
	 *   { name: 'reference', isActive: false }
	 * ];
	 * const filtered = filterNotesByContext(allNotes);
	 * // filtered === []
	 * // Also shows notice: "Spaced everything: No active contexts"
	 * 
	 * // Case 3: Note without se-contexts property → included
	 * settings.contexts = [{ name: 'learning', isActive: true }];
	 * // Note A: { frontmatter: {} } → included (backward compatibility)
	 * // Note B: { frontmatter: { 'se-contexts': ['learning'] } } → included (matches)
	 * 
	 * // Case 4: OR logic for multiple contexts
	 * settings.contexts = [
	 *   { name: 'learning', isActive: true },
	 *   { name: 'reference', isActive: false }
	 * ];
	 * // Note with ['learning', 'reference'] → included (matches 'learning')
	 * // Note with ['reference'] → excluded (doesn't match any active)
	 * // Note with ['learning'] → included (matches 'learning')
	 * ```
	 */
	private filterNotesByContext(files: TFile[]): TFile[] {
		const activeContexts = this.settings.contexts.filter(context => context.isActive).map(context => context.name);

		// Edge Case 1: No contexts defined in settings at all
		// This handles the initial state when users haven't set up contexts yet.
		// Return all notes to avoid empty review queue and allow users to start reviewing
		// immediately without configuration.
		if (this.settings.contexts.length === 0) {
			return files;
		}

		// Edge Case 2: Contexts exist but all are inactive
		// This is likely intentional (user paused all reviews), so respect it by returning
		// empty array. Show notice to confirm the intentional pause and help debug if accidental.
		if (this.settings.contexts.length > 0 && activeContexts.length === 0) {
			new Notice('Spaced everything: No active contexts');
			return [];
		}

		// Cases 3 & 4: Filter notes based on their se-contexts property
		return files.filter(file => {
			const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
			const noteContexts = frontmatter?.['se-contexts'] || [];

			// Edge Case 3: Note has no se-contexts property (or it's empty)
			// This provides backward compatibility for notes onboarded before the contexts
			// feature existed, or notes onboarded when no contexts were configured.
			// These notes should always be reviewable to avoid orphaning old content.
			if (noteContexts.length === 0) {
				return true;
			}

			// Edge Case 4: Note has contexts AND some global contexts are active
			// Use OR logic: include note if it has ANY active context (not requiring ALL contexts)
			// This is more intuitive - users expect a note tagged ['learning', 'reference']
			// to appear when reviewing 'learning' notes, even if 'reference' is inactive.
			const hasActiveContext = noteContexts.some((noteContext: string) => activeContexts.includes(noteContext));

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
					? this.parseTimestamp(metadata["se-last-reviewed"]).getTime()
					: 0;

				const isDue = currentTime > (lastReviewed + timeDiff);

				return isDue;
			})
			.sort((a, b) => {
				const aMetadata = this.app.metadataCache.getFileCache(a)?.frontmatter;
				const bMetadata = this.app.metadataCache.getFileCache(b)?.frontmatter;

				const aLastReviewed = aMetadata?.["se-last-reviewed"]
					? this.parseTimestamp(aMetadata["se-last-reviewed"]).getTime()
					: 0;
				const bLastReviewed = bMetadata?.["se-last-reviewed"]
					? this.parseTimestamp(bMetadata["se-last-reviewed"]).getTime()
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
		const now = new Date()
		const nowFormatted = this.formatTimestamp(now);

		// prompt user to select contexts
		await this.toggleNoteContexts(file);

		let activeSpacingMethod: SpacingMethod;
		const spacingMethods = this.settings.spacingMethods;

		// If there's only one spacing method, use that
		if (spacingMethods.length === 1) {
			activeSpacingMethod = spacingMethods[0];
		} else {
			// Prompt the user to select a spacing method
			const spacingMethodNames = spacingMethods.map(method => method.name);
			const selectedMethod = await suggester(spacingMethodNames, 'Select a spacing method for this note:');

			if (selectedMethod) {
				activeSpacingMethod = spacingMethods.find(method => method.name === selectedMethod)!;
			} else {
				new Notice('Onboarding cancelled by user.');
				return false;
			}
		}

		// add standard Spaced Everything frontmatter properties and values
		await this.queueFrontmatterUpdate(file, {
			'se-interval': activeSpacingMethod.defaultInterval,
			'se-last-reviewed': nowFormatted,
			'se-ease': activeSpacingMethod.defaultEaseFactor,
			'se-method': activeSpacingMethod.name
		});

		if (this.settings.logOnboardAction) {
			this.logger.log('onboarded', file, frontmatter);
		}

		new Notice(`Onboarded note to Spaced Everything: ${file.basename}`);
		return true;
	}

	async removeNoteFromSpacedEverything(file: TFile, frontmatter: any): Promise<void> {
		await this.queueFrontmatterUpdate(file, {
			'se-interval': undefined,
			'se-ease': undefined,
			'se-last-reviewed': undefined,
			'se-contexts': undefined
		});
		new Notice(`Removed note from Spaced Everything: ${file.basename}`);
		if (this.settings.logRemoveAction) {
			this.logger.log('removed', file, frontmatter);
		}
	}

	/**
	 * Calculate next review interval using SuperMemo 2.0 algorithm
	 * 
	 * SuperMemo 2.0 is a spaced repetition algorithm that adjusts review intervals based on
	 * how well the user recalls information. It uses two key metrics:
	 * 
	 * 1. Interval: Days between reviews (grows with successful recalls)
	 * 2. Ease Factor: Multiplier determining how fast intervals grow (personalizes to material difficulty)
	 * 
	 * Algorithm Behavior:
	 * - Score 0-2 (failed recall): Reset interval to 1 day, reduce ease factor
	 * - Score 3-5 (successful recall): Multiply interval by ease factor, adjust ease based on quality
	 * 
	 * The ease factor adjusts after each review to personalize the schedule:
	 * - Perfect recall (score 5): Increases ease factor (material is easy, can space more aggressively)
	 * - Difficult recall (score 3): Decreases ease factor (material is hard, space more conservatively)
	 * 
	 * Mathematical Formulas:
	 * - newInterval = oldInterval × easeFactor (for successful reviews with score ≥ 3)
	 * - newInterval = 1 (for failed reviews with score < 3)
	 * - easeAdjustment = 0.1 - (5 - score) × (0.08 + (5 - score) × 0.02)
	 * - newEaseFactor = max(1.3, oldEaseFactor + easeAdjustment)
	 * 
	 * The constants (0.1, 0.08, 0.02, 1.3) are from the original SuperMemo 2.0 paper by
	 * Piotr Woźniak and were derived empirically through extensive testing.
	 * 
	 * @param file - The note file being reviewed
	 * @param frontmatter - Current frontmatter (used for logging, actual values read from file)
	 * @param reviewScore - User's quality rating (0-5, where 0=total blackout, 3=recalled with difficulty, 5=perfect recall)
	 * @param nowFormatted - Current timestamp in configured timezone format
	 * @param activeSpacingMethod - Spacing method configuration containing default values
	 * @returns Object with new interval (in days) and adjusted ease factor
	 * 
	 * @example
	 * ```typescript
	 * // Successful review after 7 days with good recall (score 4)
	 * const result = await updateInterval(file, frontmatter, 4, timestamp, method);
	 * // result: { interval: 17.5, easeFactor: 2.5 }
	 * // Interval grew by 2.5x, ease factor remained stable
	 * 
	 * // Failed review (score 1) - couldn't recall the information
	 * const result = await updateInterval(file, frontmatter, 1, timestamp, method);
	 * // result: { interval: 1, easeFactor: 2.18 }
	 * // Interval reset to 1 day, ease factor reduced to make future reviews easier
	 * 
	 * // Perfect recall (score 5) - remembered effortlessly
	 * const result = await updateInterval(file, frontmatter, 5, timestamp, method);
	 * // result: { interval: 21, easeFactor: 2.6 }
	 * // Interval grew aggressively, ease factor increased for faster future growth
	 * ```
	 */
	async updateInterval(file: TFile, frontmatter: any, reviewScore: number, nowFormatted: string, activeSpacingMethod: SpacingMethod): Promise<{ newInterval: number; newEaseFactor: number; }> {
		let prevInterval = 1;
		let prevEaseFactor = 2.5;
		let newInterval = 0;
		let newEaseFactor = 0;

		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			// Get the previous interval and ease factor from the frontmatter
			prevInterval = Number(frontmatter['se-interval'] || activeSpacingMethod?.defaultInterval || 1);
			prevEaseFactor = Number(frontmatter['se-ease'] || activeSpacingMethod?.defaultEaseFactor || 2.5);

			// SuperMemo 2.0: Calculate ease factor adjustment based on recall quality
			// Formula: EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
			// where q = quality score (0-5)
			// 
			// Constants are from original SuperMemo 2.0 paper:
			// - 0.1: Base ease adjustment per review
			// - 0.08: Primary difficulty scaling factor
			// - 0.02: Secondary difficulty scaling factor
			// - These were empirically derived by Piotr Woźniak through extensive testing
			//
			// Higher scores increase ease (material is easier, intervals can grow faster)
			// Lower scores decrease ease (material is harder, intervals should grow slower)
			newEaseFactor = prevEaseFactor + (0.1 - (5 - reviewScore) * (0.08 + (5 - reviewScore) * 0.02));
			
			// SuperMemo 2.0: Minimum ease factor is 1.3 to prevent intervals from shrinking too much
			// This ensures intervals always grow at least 30% on successful reviews
			newEaseFactor = Math.max(1.3, parseFloat(newEaseFactor.toFixed(4)));

			// SuperMemo 2.0: Calculate new interval by multiplying previous interval by ease factor
			// This exponential growth is the core of spaced repetition - successful reviews lead to
			// progressively longer intervals, optimizing for long-term retention
			newInterval = Math.max(1, prevInterval * newEaseFactor);
			newInterval = parseFloat(newInterval.toFixed(4));

			// SuperMemo 2.0: Score < 3 indicates failed recall (couldn't remember the information)
			// Reset interval to 1 day to relearn the material quickly
			// Note: Ease factor still adjusts (decreased above) to make future reviews easier
			if (reviewScore < 3) {
				newInterval = 1;
			}

			if (this.settings.logFilePath) {
				this.logger.log('review', file, frontmatter, reviewScore, newInterval, newEaseFactor);
			}
		});

		// Update the frontmatter with the new interval and ease factor
		await this.queueFrontmatterUpdate(file, {
			'se-interval': newInterval,
			'se-ease': newEaseFactor,
			'se-last-reviewed': nowFormatted
		});

		// Notify the user of the interval change
		new Notice(`Interval updated from ${prevInterval} to ${newInterval}`);

		return { newInterval, newEaseFactor };
	}

	async getActiveSpacingMethod(file: TFile, frontmatter: any): Promise<SpacingMethod | undefined> {
		const seMethod = frontmatter?.['se-method'];

		// If se-method is set, try to find the corresponding spacing method
		let activeSpacingMethod = this.settings.spacingMethods.find(method => method.name === seMethod);

		// If se-method doesn't match any existing spacing method, proceed with fallback logic
		if (!activeSpacingMethod) {
			const noteContexts = frontmatter?.['se-contexts'] || [];

			// If no contexts are defined for the note, use the first spacing method
			if (noteContexts.length === 0) {
				activeSpacingMethod = this.settings.spacingMethods[0];
				new Notice(`Set 'se-method' to '${activeSpacingMethod.name}' for this note (no context defined).`);
				await this.queueFrontmatterUpdate(file, {'se-method': activeSpacingMethod.name});
				return activeSpacingMethod;
			}

			// Get the first context from the list
			const firstContext = noteContexts[0];

			// Find the spacing method associated with the first context
			const contextSpacingMethod = this.settings.contexts.find(
				context => context.name === firstContext
			)?.spacingMethodName;

			if (contextSpacingMethod) {
				activeSpacingMethod = this.settings.spacingMethods.find(method => method.name === contextSpacingMethod);
				if (activeSpacingMethod) {
					new Notice(`Set 'se-method' to '${activeSpacingMethod.name}' for this note (based on '${firstContext}' context).`);
					await this.queueFrontmatterUpdate(file, {'se-method': activeSpacingMethod.name});
					return activeSpacingMethod;
				}
			}

			// If no context is mapped to a spacing method, use the first spacing method
			activeSpacingMethod = this.settings.spacingMethods[0];
			new Notice(`Set 'se-method' to '${activeSpacingMethod.name}' for this note (no context mapped to a spacing method).`);
			await this.queueFrontmatterUpdate(file, {'se-method': activeSpacingMethod.name});
			return activeSpacingMethod;
		}

		// If se-method matches an existing spacing method, return it
		return activeSpacingMethod;
	}

	async updateSpacingMethod(editor: Editor, view: MarkdownView) {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file to update spacing method.');
			return;
		}

		const spacingMethodNames = this.settings.spacingMethods.map(method => method.name);
		const selectedMethod = await suggester(spacingMethodNames, 'Select a spacing method:');

		if (selectedMethod) {
			await this.queueFrontmatterUpdate(activeFile, {
				'se-method': selectedMethod
			});

			new Notice(`Updated spacing method to '${selectedMethod}' for ${activeFile.basename}`);
		} else {
			new Notice('Spacing method update cancelled by user.');
		}
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
