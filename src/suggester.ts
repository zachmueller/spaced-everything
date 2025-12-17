/**
 * Suggester - Reusable modal selection UI with fuzzy search
 * 
 * Provides a modal-based interface for selecting items from a list with
 * fuzzy search filtering. This component wraps Obsidian's SuggestModal to
 * provide a consistent, keyboard-navigable selection experience throughout
 * the plugin.
 * 
 * Used for selecting:
 * - Contexts when onboarding notes
 * - Review options during review workflow
 * - Spacing methods when configuring notes
 * 
 * The modal automatically handles keyboard navigation (arrow keys, enter)
 * and escape key to cancel. Filtering uses case-insensitive substring matching.
 * 
 * Key exports: Suggester class, suggester() helper function
 * Dependencies: Obsidian SuggestModal API
 * Integration: Modal lifecycle managed by Obsidian, escape key handled automatically
 */

import { App, SuggestModal } from 'obsidian';

/**
 * Suggester - Modal for selecting from a list with fuzzy search
 * 
 * Extends Obsidian's SuggestModal to provide a reusable selection interface.
 * The modal displays a searchable list of options and returns the selected
 * item via a callback.
 * 
 * Features:
 * - Case-insensitive fuzzy search filtering
 * - Keyboard navigation (arrows, enter, escape)
 * - Automatic modal lifecycle management
 * - Simple string-based item display
 * 
 * Usage pattern:
 * 1. Create instance with app, prompt, and items
 * 2. Set onChooseItem callback to handle selection
 * 3. Call open() to display modal
 * 4. User selects item or presses escape to cancel
 */
export class Suggester extends SuggestModal<string> {
	/** Prompt text displayed at top of modal */
	promptText: string;
	
	/** Array of selectable items */
	items: string[];
	
	/** Callback function invoked when user selects an item */
	onChooseItem: (item: string) => void;

	/**
	 * Create a new Suggester modal
	 * 
	 * @param app - Obsidian App instance for modal integration
	 * @param promptText - Text displayed as prompt/title
	 * @param items - Array of strings to choose from
	 */
	constructor(app: App, promptText: string, items: string[]) {
		super(app);
		this.promptText = promptText;
		this.items = items;
		this.onChooseItem = () => {};
	}

	/**
	 * Filter items based on user's search query
	 * 
	 * Uses case-insensitive substring matching to filter the item list.
	 * Returns all items that contain the query string anywhere within them.
	 * 
	 * @param query - User's search input
	 * @returns Filtered array of items matching the query
	 */
	getSuggestions(query: string): string[] {
		return this.items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
	}

	/**
	 * Render a single suggestion item in the list
	 * 
	 * Creates a simple div element containing the item text. This is called
	 * by Obsidian for each visible item in the filtered list.
	 * 
	 * @param item - String to render
	 * @param el - HTMLElement to render into
	 */
	renderSuggestion(item: string, el: HTMLElement) {
		el.createEl("div", { text: item });
	}

	/**
	 * Handle user selection of an item
	 * 
	 * Called when user clicks an item or presses enter while an item is
	 * highlighted. Invokes the onChooseItem callback with the selected item.
	 * 
	 * @param item - Selected item string
	 * @param evt - Mouse or keyboard event that triggered selection
	 */
	onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
		this.onChooseItem(item);
	}
}

/**
 * Promise-based helper for selecting an item from a list
 * 
 * Provides a more convenient async/await interface for the Suggester modal.
 * Opens a modal, waits for user selection, and returns the chosen item or
 * null if the user cancels.
 * 
 * This wrapper simplifies the usage pattern by eliminating the need to
 * manually set up callbacks. It's the recommended way to use Suggester
 * in async contexts.
 * 
 * @param options - Array of strings to choose from
 * @param promptText - Text displayed as prompt/title
 * @returns Promise resolving to selected string or null if cancelled
 * 
 * @example
 * ```typescript
 * // Select a context for a note
 * const contextNames = this.settings.contexts.map(c => c.name);
 * const selected = await suggester(contextNames, "Choose a context:");
 * if (selected) {
 *   // User selected an item
 *   console.log(`Selected: ${selected}`);
 * } else {
 *   // User cancelled (pressed escape)
 *   console.log("Selection cancelled");
 * }
 * ```
 */
export async function suggester(options: string[], promptText: string): Promise<string | null> {
	return new Promise((resolve) => {
		const modal = new Suggester(this.app, promptText, options);
		modal.onChooseItem = resolve;
		modal.open();
	});
}
