import { App, Notice, PluginSettingTab, Setting, normalizePath } from 'obsidian';
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
				.setButtonText('+')
				.setIcon('plus')
				.setTooltip('Add a new spacing method')
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
				.setTooltip('Add new context')
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
	}

	renderSpacingMethodSetting(containerEl: HTMLElement, spacingMethod: SpacingMethod, index: number) {
		const settingEl = containerEl.createDiv('spacing-method-settings-items');
		const settingHeader = settingEl.createDiv('spacing-method-header');
		const settingBody = settingEl.createDiv('spacing-method-body');

		new Setting(settingHeader)
			.setName(`Spacing method - #${index + 1}`)
			.setDesc('Configure the settings for this spacing method.');

		const generalSettingsDiv = settingBody.createDiv('general-settings');
		
		let oldName = spacingMethod.name;
		new Setting(generalSettingsDiv)
			.setName('Name')
			.setDesc('Enter a name for this spacing method')
			.addText((text) => {
				const textComponent = text
					.setPlaceholder('Name')
					.setValue(spacingMethod.name)
					.onChange(async (value) => {
						if (!value.trim()) {
							spacingMethod.name = `Spacing method - #${index + 1}`;
						} else {
							spacingMethod.name = value;
						}
						await this.plugin.saveSettings();
					});

				textComponent.inputEl.addEventListener('blur', () => {
					// Update contexts that were previously mapped to the old name
					if (oldName && oldName !== spacingMethod.name) {
						this.plugin.settings.contexts.forEach((context) => {
							if (context.spacingMethodName === oldName) {
								context.spacingMethodName = spacingMethod.name;
							}
						});
						this.plugin.saveSettings();
					}

					this.display(); // Re-render the settings tab
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
				})
			);

		new Setting(generalSettingsDiv)
			.setName('Custom script')
			.setDesc('>>>NOT YET IMPLEMENTED<<< —— Input the location of your custom script file that implements a spacing algorithm')
			// TODO::hide unless 'Custom Script' option set above::
			.addText((text) =>
				text
				.setPlaceholder('Custom script file name')
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
						new Notice('Default ease factor must be a number.');
					}
				})
				.setDisabled(spacingMethod.spacingAlgorithm !== 'SuperMemo2.0')
			);

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
					this.plugin.settings.spacingMethods.splice(index, 1);
					await this.plugin.saveSettings();
					this.display(); // Re-render the settings tab
				});
			});
	}

	private getSpacingMethodDropdownOptions(): Record<string, string> {
		return Object.fromEntries(this.plugin.settings.spacingMethods.map((method) => [method.name, method.name]));
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
					.addOptions(this.getSpacingMethodDropdownOptions())
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
