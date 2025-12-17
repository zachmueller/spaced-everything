/**
 * Logger - Privacy-conscious activity logging service
 * 
 * Provides configurable JSONL (JSON Lines) logging for spaced repetition
 * review activities. The logger is designed with privacy as the default,
 * allowing users to opt-in to logging specific information rather than
 * logging everything by default.
 * 
 * JSONL format (one JSON object per line) was chosen because:
 * - Easy to append new entries without parsing entire file
 * - Simple to process with standard JSON tools
 * - Human-readable for debugging and analysis
 * 
 * Key exports: Logger class
 * Dependencies: Obsidian Vault API for file operations
 * Integration: Configured via plugin settings, gracefully degrades if logging disabled
 */

import { TFile, App } from 'obsidian';
import { SpacedEverythingPluginSettings } from './settings';

/**
 * Logger - Records review activity to JSONL file
 * 
 * Logs user review actions with configurable privacy controls.
 * Users can choose to log:
 * - Just the action and timestamp (most private)
 * - Note titles (helps identify patterns)
 * - Specific frontmatter properties (for detailed analysis)
 * - All frontmatter properties (least private, use '*')
 * 
 * The logger silently fails if logging is disabled (empty logFilePath)
 * or if file operations fail, ensuring the plugin continues working
 * even if logging encounters errors.
 * 
 * @example
 * ```typescript
 * // Log a review action with minimal data
 * await logger.log('review', file, frontmatter, score, interval, ease);
 * 
 * // Logging is automatically skipped if logFilePath is empty
 * settings.logFilePath = '';
 * await logger.log('review', file); // Does nothing
 * ```
 */
export class Logger {
	private app: App;
	private settings: SpacedEverythingPluginSettings;
	private logFilePath: string;

	/**
	 * Create a new logger instance
	 * 
	 * @param app - Obsidian app instance for vault operations
	 * @param settings - Plugin settings containing logging configuration
	 */
	constructor(app: App, settings: SpacedEverythingPluginSettings) {
		this.app = app;
		this.settings = settings;
		this.logFilePath = settings.logFilePath;
	}

	/**
	 * Log a review action with configurable privacy controls
	 * 
	 * Records review actions to a JSONL file, including only the information
	 * specified in plugin settings. If logFilePath is empty, logging is
	 * disabled and this method returns immediately.
	 * 
	 * All parameters except action and file are optional to support different
	 * types of actions (review, onboard, context-change, etc.).
	 * 
	 * Side effects:
	 * - Creates log file if it doesn't exist
	 * - Appends new line to log file
	 * - Logs errors to console if file operations fail
	 * 
	 * @param action - Type of action being logged (e.g., 'review', 'onboard')
	 * @param file - Note file involved in the action
	 * @param frontmatter - Note's frontmatter (filtered based on settings)
	 * @param reviewScore - User's quality score for review (0-5)
	 * @param newInterval - New interval calculated (in days)
	 * @param newEaseFactor - New ease factor calculated
	 * 
	 * @example
	 * ```typescript
	 * // Log a completed review
	 * await logger.log(
	 *   'review',
	 *   file,
	 *   { 'se-interval': 7, 'se-ease-factor': 2.5 },
	 *   4,  // review score
	 *   17, // new interval
	 *   2.6 // new ease factor
	 * );
	 * 
	 * // Log an onboarding action (no score/interval)
	 * await logger.log('onboard', file, frontmatter);
	 * ```
	 */
	async log(action: string, file: TFile, frontmatter: any = {}, reviewScore?: number, newInterval?: number, newEaseFactor?: number) {
		// Return early if logging is disabled (privacy-first default)
		if (this.logFilePath === '') return;

		const logData = this.generateLogData(action, file, frontmatter, reviewScore, newInterval, newEaseFactor);
		await this.appendToLogFile(logData);
	}

	/**
	 * Generate JSONL log entry with privacy controls
	 * 
	 * Constructs a JSON object containing only the properties enabled in
	 * settings. This privacy-first approach ensures users explicitly opt-in
	 * to logging sensitive information like note titles or frontmatter.
	 * 
	 * Privacy levels (from most to least private):
	 * 1. logNoteTitle: false, logFrontMatterProperties: []
	 *    → Only logs action and timestamp
	 * 2. logNoteTitle: true, logFrontMatterProperties: []
	 *    → Adds note title for pattern analysis
	 * 3. logNoteTitle: true, logFrontMatterProperties: ['se-interval']
	 *    → Logs specific frontmatter properties
	 * 4. logNoteTitle: true, logFrontMatterProperties: ['*']
	 *    → Logs all frontmatter (least private)
	 * 
	 * @param action - Type of action being logged
	 * @param file - Note file involved in the action
	 * @param frontmatter - Note's frontmatter to filter
	 * @param reviewScore - Optional review quality score
	 * @param newInterval - Optional new interval
	 * @param newEaseFactor - Optional new ease factor
	 * @returns JSONL string (JSON object + newline)
	 */
	private generateLogData(action: string, file: TFile, frontmatter: any, reviewScore?: number, newInterval?: number, newEaseFactor?: number): string {
		const logData: Record<string, any> = {
			action,
			timestamp: new Date().toISOString(),
		};

		// Include note title only if user has opted in
		// (helps identify patterns without exposing full content)
		if (this.settings.logNoteTitle) {
			logData.noteTitle = file.basename;
		}

		// Include frontmatter based on user's privacy preferences
		if (this.settings.logFrontMatterProperties.length > 0) {
			logData.frontmatter = {};
			const arr = this.settings.logFrontMatterProperties;
			
			// Wildcard '*' means log all frontmatter properties
			// This is the least private option, useful for detailed analysis
			if (Array.isArray(arr) && arr.length === 1 && arr[0] === '*') {
				logData.frontmatter = frontmatter;
			} else {
				// Log only explicitly specified properties
				// This allows users to log review metrics (se-interval, se-ease-factor)
				// without logging potentially sensitive custom properties
				for (const property of this.settings.logFrontMatterProperties) {
					if (frontmatter[property]) {
						logData.frontmatter[property] = frontmatter[property];
					}
				}
			}
		}

		// Include review-specific metrics if provided
		// These are always included when present as they're core to understanding
		// the spaced repetition system's behavior
		if (reviewScore) {
			logData.reviewScore = reviewScore;
		}

		if (newInterval) {
			logData.newInterval = newInterval;
		}

		if (newEaseFactor) {
			logData.newEaseFactor = newEaseFactor;
		}

		// Return JSONL format: JSON object + newline
		return JSON.stringify(logData) + '\n';
	}

	/**
	 * Append log entry to JSONL file
	 * 
	 * Creates the log file if it doesn't exist, then appends the log entry.
	 * All errors are caught and logged to console to prevent logging failures
	 * from breaking the plugin's core functionality.
	 * 
	 * This method is gracefully degrading - if the log file can't be created
	 * or written to, the error is logged but the plugin continues working.
	 * 
	 * @param logData - JSONL string to append (JSON object + newline)
	 */
	private async appendToLogFile(logData: string) {
		try {
			let logFile = this.app.vault.getAbstractFileByPath(this.logFilePath);
			if (!logFile) {
				console.log(`Log file ${this.logFilePath} does not exist. Creating a new file.`);
				await this.app.vault.create(this.logFilePath, '');
				logFile = this.app.vault.getAbstractFileByPath(this.logFilePath);
			}

			if (logFile) {
				const fileObj = this.app.vault.getFileByPath(logFile.path);
				if (fileObj) {
					await this.app.vault.append(fileObj, logData);
				} else {
					console.error(`Error: Unable to access log file ${this.logFilePath}`);
				}
			} else {
				console.error(`Error: Unable to create or access log file ${this.logFilePath}`);
			}
		} catch (error) {
			// Catch all errors to prevent logging failures from breaking plugin
			// User can check console if they notice logging isn't working
			console.error(`Error writing to log file: ${error}`);
		}
	}
}
