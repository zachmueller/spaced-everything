import { App, Notice, PluginSettingTab, Setting, normalizePath, Modal, TAbstractFile, TFile, TFolder } from 'obsidian';
import { Context, ReviewOption, SpacingMethod } from './types';
import SpacedEverythingPlugin from './main';

interface SpacedEverythingPluginSettings {
	logFilePath: string;
	logOnboardAction: boolean;
	logRemoveAction: boolean;
	logNoteTitle: boolean;
	logFrontMatterProperties: string[];
	contexts: Context[];
	spacingMethods: SpacingMethod[];
	capturedThoughtTitleTemplate: string;
	capturedThoughtDirectory: string;
	capturedThoughtNoteTemplate: string;
	includeShortThoughtInAlias: boolean;
	shortCapturedThoughtThreshold: number;
	openCapturedThoughtInNewTab: boolean;
	onboardingExcludedFolders: string[];
}

export type { SpacedEverythingPluginSettings };

export class SpacedEverythingSettingTab extends PluginSettingTab {
	plugin: SpacedEverythingPlugin;

	constructor(app: App, plugin: SpacedEverythingPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl).setName('Spacing methods').setHeading();
		const spacingMethodsSettingDiv = containerEl.createDiv();
		const spacingMethodsDiv = containerEl.createDiv();
		const addSpacingMethodDiv = containerEl.createDiv();

		// construct description to include link to docs
		const desc = document.createDocumentFragment();
		desc.append(
			'Define and manage the spacing methods you want to use for your spaced everything practice. ',
			'You can create multiple spacing methods and map them to different contexts. ',
			'Check the ',
			desc.createEl('a', {
				href: 'https://github.com/zachmueller/spaced-everything/blob/main/README.md',
				text: 'documentation',
			}),
			' for more information.'
		);
		
		new Setting(spacingMethodsSettingDiv)
			.setDesc(desc);

		this.plugin.settings.spacingMethods.forEach((spacingMethod, index) => {
			this.renderSpacingMethodSetting(spacingMethodsDiv, spacingMethod, index);
		});

		new Setting(addSpacingMethodDiv)
			.addButton((button) =>
				button
				.setButtonText('Add spacing method')
				.setTooltip('Add a new spacing method')
				.onClick(async () => {
					const newSpacingMethod: SpacingMethod = {
						name: `Spacing method #${this.plugin.settings.spacingMethods.length + 1}`,
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
				.setTooltip('Add new context')
				.onClick(async () => {
					const newContext: Context = {
						name: '',
						isActive: false,
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
			.setDesc('Choose the file path where Spaced Everything logs are stored. Leave blank to not capture logs. Note: output data format is JSONL (i.e., `.jsonl` filename extension recommended).')
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
			.setDesc('Provide a list (one per line) of frontmatter properties you would like to include in the Spaced Everything logs. Input just an asterisk (*) to include all frontmatter properties.')
			.addTextArea(textArea => {
				const properties = this.plugin.settings.logFrontMatterProperties ?? [];
				const propertyStr = properties.join('\n');
				textArea
				.setPlaceholder('Enter frontmatter properties, one per line')
				.setValue(propertyStr)
				.onChange(async (value) => {
					if (value.trim() === '*') {
						this.plugin.settings.logFrontMatterProperties = ['*'];
					} else {
						const properties = value.trim().split('\n').filter(property => property.trim() !== '');
						this.plugin.settings.logFrontMatterProperties = properties;
					}
					await this.plugin.saveSettings();
				});
			});

		// Capture thoughts settings
		new Setting(containerEl).setName('Capture thought').setHeading();

		new Setting(containerEl)
			.setName('Note title template')
			.setDesc('Template for generating the title of the new note')
			.addText((text) =>
				text
					.setPlaceholder('Enter your template here')
					.setValue(this.plugin.settings.capturedThoughtTitleTemplate)
					.onChange(async (value) => {
						this.plugin.settings.capturedThoughtTitleTemplate = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Note directory')
			.setDesc('Directory where the new note should be created (leave empty for default directory)')
			.addText((text) =>
				text
					.setPlaceholder('Enter your directory path here')
					.setValue(this.plugin.settings.capturedThoughtDirectory)
					.onChange(async (value) => {
						const trimmedValue = value.replace(/\/+$/, ''); // Remove trailing slashes
						this.plugin.settings.capturedThoughtDirectory = trimmedValue;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('New note template')
			.setDesc('Template for the initial content of the new note')
			.addTextArea((ta) =>
				ta
					.setPlaceholder('Enter your template here')
					.setValue(this.plugin.settings.capturedThoughtNoteTemplate)
					.onChange(async (value) => {
						this.plugin.settings.capturedThoughtNoteTemplate = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Include short thought in alias')
			.setDesc('Include the thought as an alias in the frontmatter if it\'s shorter than the threshold')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeShortThoughtInAlias)
					.onChange(async (value) => {
						this.plugin.settings.includeShortThoughtInAlias = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Short thought threshold')
			.setDesc('Maximum length of the thought (in characters) for it to be included as an alias')
			.addText((text) =>
				text
					.setPlaceholder('Enter your threshold here')
					.setValue(this.plugin.settings.shortCapturedThoughtThreshold.toString())
					.onChange(async (value) => {
						const numericValue = parseInt(value, 10);
						if (!isNaN(numericValue) && numericValue >= 0) {
							this.plugin.settings.shortCapturedThoughtThreshold = numericValue;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName('Open in new tab')
			.setDesc('Open the newly created note in a new tab. If turned off, captured thought note opens in currently active tab.')
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openCapturedThoughtInNewTab)
					.onChange(async (value) => {
						this.plugin.settings.openCapturedThoughtInNewTab = value;
						await this.plugin.saveSettings();
					})
			);


		// Onboard all notes
		new Setting(containerEl).setName('Onboard all notes (beta)')
			.setHeading()
			.setDesc('This provides an optional means of onboarding every note in your vault to the Spaced Everything system. Importantly, the plugin uses frontmatter properties on notes to track relevant metadata to perform the spacing algorithm actions. So it is recommended to use the "Excluded folders" setting below to filter out subsets of notes that you wish to avoid onboarding. Performing this action will not change any existing Spaced Everything frontmatter if you already have some notes oboarded.\n\nThis is still a beta feature. Currently, it asusmes to only apply the settings from the first Spacing Method (defined above) and assumes to not set any context for notes onboarded in this manner.');

		new Setting(containerEl)
			.setName('Excluded folders')
			.setDesc('Enter the paths of any folders you want to exclude from the onboarding process (one per line). Consider adding folders that contain things like templates or scripts that may not work if frontmatter properties are added to them.')
			.addTextArea((textArea) => {
				textArea.setValue(this.plugin.settings.onboardingExcludedFolders.join('\n')).onChange(async (value) => {
					this.plugin.settings.onboardingExcludedFolders = value.trim().split('\n').filter((v) => v);
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Onboard all notes')
			.setDesc('Click the button to add the required frontmatter properties to all notes in your vault, excluding the folders specified above.')
			.addButton((button) =>
				button
					.setButtonText('Onboard all notes')
					.onClick(async () => this.showConfirmationModal())
			);
	}


	// functions for onboarding all notes
	async showConfirmationModal() {
		const modal = new ConfirmationModal(this.app, this.plugin);
		modal.open();
	}

	async addFrontMatterPropertiesToAllNotes() {
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			if (!this.isFileExcluded(file)) {
				await this.addFrontMatterPropertiesToNote(file);
			}
		}
	}

	isFileExcluded(file: TAbstractFile): boolean {
		const excludedFolders = this.plugin.settings.onboardingExcludedFolders;
		let parent: TFolder | null = file.parent;

		while (parent) {
			if (excludedFolders.includes(parent.path)) {
				return true;
			}
			parent = parent.parent;
		}

		return false;
	}

	async addFrontMatterPropertiesToNote(file: TFile) {
		const frontMatter = this.app.metadataCache.getCache(file.path)?.frontmatter;
		const modifiedFrontMatter = {
			'se-interval': frontMatter?.['se-interval'] || this.plugin.settings.spacingMethods[0].defaultInterval,
			'se-last-reviewed': frontMatter?.['se-last-reviewed'] || new Date().toISOString().split('.')[0],
			'se-ease': frontMatter?.['se-ease'] || this.plugin.settings.spacingMethods[0].defaultEaseFactor,
		};

		await this.app.fileManager.processFrontMatter(file, async (frontmatter: any) => {
			frontmatter["se-interval"] = modifiedFrontMatter["se-interval"];
			frontmatter["se-last-reviewed"] = modifiedFrontMatter["se-last-reviewed"];
			frontmatter["se-ease"] = modifiedFrontMatter["se-ease"];
		});
	}


	// Functions for rendering subsets of the settings
	renderSpacingMethodSetting(containerEl: HTMLElement, spacingMethod: SpacingMethod, index: number) {
		const settingEl = containerEl.createDiv('spacing-method-settings-items');
		const settingHeader = settingEl.createDiv('spacing-method-header');
		const settingBody = settingEl.createDiv('spacing-method-body');

		const defaultName = `Spacing method #${index + 1}`;

		new Setting(settingHeader)
			.setName(defaultName)
			.setDesc('Configure the settings for this spacing method.');

		const generalSettingsDiv = settingBody.createDiv('general-settings');

		new Setting(generalSettingsDiv)
			.setName('Name')
			.setDesc('Enter a name for this spacing method')
			.addText((text) => {
				const textComponent = text
					.setPlaceholder('Name')
					.setValue(spacingMethod.name || defaultName)
					.onChange(async (value) => {
						if (!value.trim()) {
							spacingMethod.name = defaultName;
						} else {
							spacingMethod.name = value;
						}
						await this.plugin.saveSettings();
					});

				return textComponent;
			});

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
						new Notice('Default interval must be a number.');
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
					'Custom': 'Custom script',
				})
				.setValue(spacingMethod.spacingAlgorithm)
				.onChange(async (value) => {
					spacingMethod.spacingAlgorithm = value;
					await this.plugin.saveSettings();
					// Update the visibility of the settings based on the selected value
					customScriptSettingContainer.style.display = value === 'Custom' ? 'block' : 'none';
					defaultEaseFactorSettingContainer.style.display = value === 'SuperMemo2.0' ? 'block' : 'none';
				})
			);

		const customScriptSettingContainer = generalSettingsDiv.createDiv();
		const customScriptSetting = new Setting(customScriptSettingContainer)
			.setName('Custom script')
			.setDesc('>>>NOT YET IMPLEMENTED<<< —— Input the location of your custom script file that implements a spacing algorithm')
			.addText((text) =>
				text
				.setPlaceholder('Custom script file name')
				.setValue(spacingMethod.customScriptFileName)
				.onChange(async (value) => {
					// TODO::implement helper stuff for auto-completing paths/filenames::
					spacingMethod.customScriptFileName = value;
					await this.plugin.saveSettings();
				})
			);

		const defaultEaseFactorSettingContainer = generalSettingsDiv.createDiv();
		const defaultEaseFactorSetting = new Setting(defaultEaseFactorSettingContainer)
			.setName('Default ease factor')
			.setDesc('The default ease factor')
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
						new Notice('Default ease factor must be a number.');
					}
				})
			);

		// Set initial visibility of settings based on the current value of the 'Spacing algorithm' dropdown
		customScriptSettingContainer.style.display = spacingMethod.spacingAlgorithm === 'Custom' ? 'block' : 'none';
		defaultEaseFactorSettingContainer.style.display = spacingMethod.spacingAlgorithm === 'SuperMemo2.0' ? 'block' : 'none';

		// Render review options for the spacing method
		const reviewOptionsDiv = settingBody.createDiv('review-options');
		new Setting(reviewOptionsDiv)
			.setHeading()
			.setName('Review options')
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
					.setTooltip('Delete spacing method')
					.onClick(async () => {
						if (this.plugin.settings.spacingMethods.length === 1) {
							new Notice('Cannot delete the last spacing method');
						} else {
							this.plugin.settings.spacingMethods.splice(index, 1);
							await this.plugin.saveSettings();
							this.display(); // Re-render the settings tab
						}
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

class ConfirmationModal extends Modal {
	plugin: SpacedEverythingPlugin;
	settingsTab: SpacedEverythingSettingTab;

	constructor(app: App, plugin: SpacedEverythingPlugin) {
		super(app);
		this.plugin = plugin;
		this.settingsTab = new SpacedEverythingSettingTab(app, plugin);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Confirm Action' });
		contentEl.createEl('p', { text: 'Are you sure you want to onboard to all notes in your vault? This action cannot be undone. It is highly recommended you create a full backup of your vault prior to running this vault-wide action, in case any unexpected changes result.' });

		const confirmButton = new Setting(contentEl)
			.addButton((button) => {
				button
					.setButtonText('Confirm')
					.setCta()
					.onClick(async () => {
						await this.settingsTab.addFrontMatterPropertiesToAllNotes();
						this.close();
						new Notice('All notes onboarded');
					});
			});

		const cancelButton = new Setting(contentEl)
			.addButton((button) => {
				button
					.setButtonText('Cancel')
					.onClick(() => {
						this.close();
					});
			});
	}

	onClose() {
		this.contentEl.empty();
	}
}
