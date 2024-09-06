import { TFile, App } from 'obsidian';
import { SpacedWritingPracticePluginSettings } from './main';

export class Logger {
	private app: App;
	private settings: SpacedWritingPracticePluginSettings;
	private logFilePath: string;

	constructor(app: App, settings: SpacedWritingPracticePluginSettings) {
		this.app = app;
		this.settings = settings;
		this.logFilePath = settings.logFilePath;
	}

	async log(action: string, file: TFile, frontmatter: any = {}, reviewScore?: number, newInterval?: number, newEaseFactor?: number) {
		if (this.logFilePath === '') return; // Return early if log file path is not set

		const logData = this.generateLogData(action, file, frontmatter, reviewScore, newInterval, newEaseFactor);
		await this.appendToLogFile(logData);
	}

	private generateLogData(action: string, file: TFile, frontmatter: any, reviewScore?: number, newInterval?: number, newEaseFactor?: number): string {
		const logData: Record<string, any> = {
			action,
			timestamp: new Date().toISOString(),
		};

		if (this.settings.logNoteTitle) {
			logData.noteTitle = file.basename;
		}

		if (this.settings.logFrontMatterProperties.length > 0) {
			logData.frontmatter = {};
			for (const property of this.settings.logFrontMatterProperties) {
				if (frontmatter[property]) {
					logData.frontmatter[property] = frontmatter[property];
				}
			}
		}

		if (reviewScore) {
			logData.reviewScore = reviewScore;
		}

		if (newInterval) {
			logData.newInterval = newInterval;
		}

		if (newEaseFactor) {
			logData.newEaseFactor = newEaseFactor;
		}

		return JSON.stringify(logData) + '\n';
	}

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
			console.error(`Error writing to log file: ${error}`);
		}
	}
}