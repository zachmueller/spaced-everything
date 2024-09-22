import { App, SuggestModal } from 'obsidian';

export class Suggester extends SuggestModal<string> {
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

export async function suggester(options: string[], promptText: string): Promise<string | null> {
	return new Promise((resolve) => {
		const modal = new Suggester(this.app, promptText, options);
		modal.onChooseItem = resolve;
		modal.open();
	});
}
