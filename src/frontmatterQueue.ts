/**
 * FrontmatterQueue - Batched frontmatter update manager
 * 
 * This queue solves a critical race condition problem in Obsidian: when files
 * are modified, Obsidian fires multiple 'modify' events in rapid succession
 * (sometimes 3-5 events for a single user edit). If frontmatter updates are
 * applied immediately in response to each event, later events can overwrite
 * earlier changes, resulting in data loss or corruption.
 * 
 * This queue prevents data loss by:
 * 1. Batching all updates by file path
 * 2. Deduplicating updates using Object.assign (later values win)
 * 3. Applying all updates atomically via processFrontMatter API
 * 
 * The queue guarantees that only the final merged state is written to disk,
 * ensuring data integrity even during rapid file modifications.
 * 
 * Key exports: FrontmatterQueue class
 * Dependencies: Obsidian App API (fileManager.processFrontMatter)
 * Integration: Wraps callback-based processFrontMatter with Promise interface
 */
import { TFile, App } from 'obsidian';

/**
 * FrontmatterQueue - Queue manager for atomic frontmatter updates
 * 
 * This class coordinates frontmatter updates to prevent race conditions with
 * Obsidian's file save events. Updates are queued by file path and merged
 * before being applied, ensuring data consistency.
 * 
 * The queue uses a Map to deduplicate updates per file. Multiple calls to
 * add() for the same file will merge updates via Object.assign, with later
 * values overwriting earlier ones. This ensures the final state reflects
 * all intended changes without conflicts.
 * 
 * Usage pattern:
 * 1. Call add() one or more times to queue updates
 * 2. Call process() to apply all queued updates atomically
 * 3. Queue clears automatically after processing
 * 
 * @example
 * ```typescript
 * const queue = new FrontmatterQueue(app);
 * 
 * // Queue multiple updates for same file - they merge automatically
 * await queue.add(file, { lastReviewed: Date.now() });
 * await queue.add(file, { interval: 7 }); // Merged with previous update
 * 
 * // Apply all queued updates atomically
 * await queue.process();
 * ```
 */
export class FrontmatterQueue {
    private queue: Map<string, Record<string, any>> = new Map();
    private app: App;

    constructor(app: App) {
        this.app = app;
    }

    /**
     * Queue frontmatter updates for a file
     * 
     * Updates are not applied immediately. Instead, they're added to a queue
     * keyed by file path. If updates already exist for this file, new updates
     * are merged via Object.assign, with later values overwriting earlier ones.
     * 
     * This deduplication is critical for preventing race conditions. When
     * Obsidian fires multiple save events for the same edit, multiple calls
     * to add() will merge into a single atomic update during process().
     * 
     * Special behavior: Setting a property to undefined marks it for deletion.
     * When process() runs, undefined values cause properties to be deleted
     * from frontmatter rather than set to undefined.
     * 
     * @param file - The note file to update (TFile from Obsidian API)
     * @param updates - Frontmatter properties to add or modify (undefined = delete)
     * 
     * @example
     * ```typescript
     * // Add new property
     * queue.add(file, { lastReviewed: Date.now() });
     * 
     * // Update multiple properties
     * queue.add(file, { 
     *   interval: 7,
     *   easeFactor: 2.5 
     * });
     * 
     * // Later update to same file merges automatically
     * queue.add(file, { interval: 14 }); // interval becomes 14, easeFactor stays 2.5
     * 
     * // Delete property by setting to undefined
     * queue.add(file, { oldProperty: undefined });
     * ```
     */
    add(file: TFile, updates: Record<string, any>) {
        const path = file.path;
        if (!this.queue.has(path)) {
            this.queue.set(path, {});
        }
        const fileUpdates = this.queue.get(path)!;
        
        // Merge new updates with existing queued updates for this file
        // Object.assign ensures later values overwrite earlier ones, providing
        // automatic deduplication when multiple updates happen in quick succession
        Object.assign(fileUpdates, updates);
    }

    /**
     * Apply all queued updates atomically
     * 
     * Processes each file in the queue, applying merged updates through
     * Obsidian's processFrontMatter API. This ensures updates are atomic
     * and don't conflict with concurrent file modifications.
     * 
     * All updates are applied in parallel via Promise.all for performance.
     * The queue is cleared after successful processing, ensuring updates
     * are only applied once.
     * 
     * If a queued file no longer exists, it's silently skipped. This can
     * happen if a file is deleted between add() and process() calls.
     * 
     * @returns Promise that resolves when all updates are applied
     * 
     * @example
     * ```typescript
     * // Queue several updates
     * queue.add(file1, { lastReviewed: Date.now() });
     * queue.add(file2, { interval: 7 });
     * queue.add(file1, { interval: 14 }); // Merges with first file1 update
     * 
     * // Apply all updates atomically
     * await queue.process();
     * 
     * // Queue is now empty and ready for new updates
     * ```
     */
    async process() {
        for (const [path, updates] of this.queue) {
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                await this.updateFrontmatter(file, updates);
            }
        }
        this.queue.clear();
    }

    /**
     * Update frontmatter for a single file
     * 
     * Wraps Obsidian's callback-based processFrontMatter API with a Promise
     * interface. The callback receives current frontmatter and modifies it
     * in place, with changes automatically saved by Obsidian.
     * 
     * Properties set to undefined are deleted rather than set to undefined,
     * which is the standard pattern for removing frontmatter properties.
     * 
     * @param file - File to update
     * @param updates - Properties to apply (undefined = delete)
     * @returns Promise that resolves when update completes
     */
    private async updateFrontmatter(file: TFile, updates: Record<string, any>) {
        return new Promise<void>((resolve) => {
            this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                // Apply each update to frontmatter
                Object.entries(updates).forEach(([key, value]) => {
                    if (value === undefined) {
                        // Delete property if value is undefined
                        // This is the standard pattern for removing frontmatter
                        delete frontmatter[key];
                    } else {
                        // Add or update property with new value
                        frontmatter[key] = value;
                    }
                });
                resolve();
            });
        });
    }
}
