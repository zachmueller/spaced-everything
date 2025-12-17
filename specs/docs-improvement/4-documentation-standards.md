# Documentation Standards

**Generated:** 2025-12-18  
**Based On:** Documentation Audit v1.0  
**Purpose:** Define project-specific documentation guidelines for Spaced Everything

## General Principles

### Purpose of Documentation

Documentation in this project serves to:
1. **Explain architectural decisions** - Help developers understand why code is structured as it is (e.g., why frontmatterQueue exists to prevent race conditions)
2. **Clarify complex algorithms** - Make mathematical formulas and non-obvious logic understandable (e.g., SuperMemo 2.0 implementation)
3. **Document Obsidian integration** - Explain platform-specific patterns for developers unfamiliar with Obsidian's API
4. **Provide context for business logic** - Explain domain concepts like spaced repetition, contexts, and review workflows
5. **Support future maintenance** - Enable developers to modify code confidently without introducing bugs

### When to Document

**Always Document:**
- Public APIs and exported functions
- Complex algorithms or mathematical formulas (e.g., SuperMemo 2.0)
- Non-obvious design decisions (e.g., queue patterns, race condition prevention)
- Integration points with Obsidian API
- Business logic with multiple edge cases (e.g., context filtering)
- Data transformations affecting user data (e.g., frontmatter updates)

**Consider Documenting:**
- Private methods with complex logic
- Helper functions with non-obvious behavior
- Configuration or settings with conditional visibility
- UI rendering patterns in settings

**Rarely Document:**
- Simple getters/setters
- Self-explanatory utility functions (e.g., basic date formatting)
- Standard patterns with obvious behavior

### Documentation Philosophy

**Focus on WHY, not WHAT:**
- ✅ "Queue frontmatter updates to avoid race conditions with rapid file changes"
- ❌ "Updates the queue"

**Provide Context:**
- ✅ "Uses debouncing because Obsidian fires multiple events for a single save"
- ❌ "Debounces the function"

**Explain Domain Concepts:**
- ✅ "SuperMemo 2.0 algorithm calculates next review interval based on recall quality"
- ❌ "Calculates interval"

**Be Concise but Complete:**
- Include enough detail to understand without reading implementation
- Don't explain every line—trust readers to understand TypeScript
- Explain the approach and rationale, not the syntax

**Target Multiple Audiences:**
- **Users reading README:** Need to understand features and workflows
- **Plugin developers:** Need to understand Obsidian integration patterns
- **Contributors:** Need to understand architecture and business logic
- **Future maintainers:** Need to understand why decisions were made

## File Header Standards

### Required Format

Every source file should begin with:

```typescript
/**
 * [Module Name] - [One-sentence purpose]
 * 
 * [2-3 sentences explaining:
 *  - Why this module exists and what problem it solves
 *  - How it fits into the larger architecture
 *  - Any critical design decisions or constraints]
 * 
 * Key exports: [List main exports if not obvious from filename]
 * Dependencies: [Note unusual or important dependencies]
 * Integration: [Note Obsidian-specific patterns if applicable]
 */
```

### Example: Core Plugin Module

```typescript
/**
 * SpacedEverythingPlugin - Main plugin orchestrator for spaced repetition
 * 
 * This is the primary entry point that coordinates all plugin functionality.
 * It manages the plugin lifecycle, registers commands, handles settings,
 * and orchestrates review workflows using the SuperMemo 2.0 algorithm.
 * 
 * The plugin uses a queue-based frontmatter update system to prevent race
 * conditions with Obsidian's file save events.
 * 
 * Key exports: SpacedEverythingPlugin class
 * Dependencies: Obsidian Plugin API, frontmatterQueue for atomic updates
 * Integration: Extends Obsidian's Plugin class, uses MetadataCache for file scanning
 */
```

### Example: Utility Module

```typescript
/**
 * FrontmatterQueue - Batched frontmatter update manager
 * 
 * Obsidian fires multiple save events when users edit files, creating
 * race conditions if frontmatter is updated immediately. This queue
 * batches updates and applies them atomically to ensure data integrity.
 * 
 * Updates are deduplicated using Object.assign, so multiple updates to
 * the same file are merged before being written to disk.
 * 
 * Key exports: FrontmatterQueue class
 * Dependencies: Obsidian Vault API for file operations
 * Integration: Wraps processFrontMatter() to provide Promise interface
 */
```

### Example: UI Component

```typescript
/**
 * Suggester - Modal-based item selection with fuzzy search
 * 
 * A reusable component for presenting users with a searchable list
 * of options. Extends Obsidian's SuggestModal to provide fuzzy filtering
 * and keyboard navigation.
 * 
 * This is used throughout the plugin for selecting contexts, review options,
 * and files to onboard to spaced repetition.
 * 
 * Key exports: Suggester class, suggester() helper function
 * Dependencies: Obsidian SuggestModal API
 * Integration: Modal lifecycle managed by Obsidian, escape key handled automatically
 */
```

### Anti-Pattern

```typescript
// This file has the frontmatter queue
// It exports the FrontmatterQueue class
```

**Why this is bad:** 
- Doesn't explain why the module exists
- Doesn't explain the problem it solves
- Provides no architectural context
- Restates the obvious from the filename

## Class and Interface Documentation

### Class Documentation Format

```typescript
/**
 * [ClassName] - [Purpose and primary responsibility]
 * 
 * [2-4 sentences explaining:
 *  - What role this class plays in the system
 *  - Key responsibilities and constraints
 *  - Important lifecycle or usage patterns
 *  - Any critical design decisions]
 * 
 * @example
 * ```typescript
 * // Typical usage pattern
 * const queue = new FrontmatterQueue(vault);
 * await queue.add(file, { lastReviewed: Date.now() });
 * await queue.process();
 * ```
 */
class ClassName {
  // ...
}
```

### Interface Documentation Format

```typescript
/**
 * [InterfaceName] - [What this interface represents]
 * 
 * [2-3 sentences explaining:
 *  - The domain concept this models
 *  - When and why to use this interface
 *  - Any important constraints or relationships]
 */
interface InterfaceName {
  /**
   * [Property description explaining what it represents and why it exists]
   * 
   * [Additional context if needed, such as:
   *  - Valid ranges or constraints
   *  - Relationships to other properties
   *  - When this property is optional/required]
   */
  propertyName: type;
}
```

### Example: Domain Interface

```typescript
/**
 * SpacingMethod - Configuration for a spaced repetition algorithm
 * 
 * Defines the algorithm and parameters used to calculate review intervals.
 * Each context can have its own spacing method, allowing different review
 * schedules for different types of notes (e.g., daily for language learning,
 * weekly for reference material).
 */
interface SpacingMethod {
  /**
   * Algorithm identifier
   * Currently only 'SuperMemo 2.0' is supported, but designed to be extensible
   */
  algorithmName: string;
  
  /**
   * Initial ease factor for new notes
   * 
   * In SuperMemo 2.0, this determines how quickly intervals grow.
   * Default: 2.5 (intervals multiply by 2.5x on successful recall)
   * 
   * Optional because only relevant to SuperMemo 2.0 algorithm
   */
  defaultEaseFactor?: number;
  
  /**
   * Maximum review interval in days
   * 
   * Prevents intervals from growing too large and notes being forgotten.
   * Default: 365 (review at least annually)
   * 
   * Optional to allow unlimited growth if desired
   */
  maxInterval?: number;
}
```

### Example: Plugin Class

```typescript
/**
 * SpacedEverythingPlugin - Main plugin orchestrator
 * 
 * Coordinates all plugin functionality including command registration,
 * settings management, and review workflows. Uses SuperMemo 2.0 algorithm
 * to calculate optimal review intervals based on user feedback.
 * 
 * The plugin processes frontmatter updates through a queue to prevent
 * race conditions with Obsidian's file save events.
 * 
 * Lifecycle:
 * 1. onload() - Registers commands and settings
 * 2. User triggers review workflow
 * 3. Plugin scans vault and calculates due notes
 * 4. User reviews notes and provides quality scores
 * 5. Plugin updates intervals using SuperMemo 2.0
 * 6. onunload() - Cleanup (minimal for this plugin)
 * 
 * @example
 * ```typescript
 * // Plugin is instantiated by Obsidian automatically
 * // Users interact via registered commands:
 * // - "Spaced Everything: Open next item for review"
 * // - "Spaced Everything: Log review outcome"
 * ```
 */
export default class SpacedEverythingPlugin extends Plugin {
  // ...
}
```

### Anti-Pattern

```typescript
/**
 * Frontmatter queue class
 */
class FrontmatterQueue {
  // ...
}
```

**Why this is bad:**
- Doesn't explain purpose or responsibilities
- No context about why this class exists
- No usage guidance
- Restates the class name without adding value

## Method and Function Documentation

### Method Documentation Format

```typescript
/**
 * [One-sentence summary of what the method does and why it exists]
 * 
 * [2-4 sentences providing:
 *  - Additional context or important details
 *  - Side effects or state changes
 *  - Error conditions or edge cases
 *  - Performance considerations if relevant]
 * 
 * @param paramName - [What this parameter represents in domain terms, not just type]
 * @param anotherParam - [Include constraints, valid ranges, or special values]
 * @returns [What the return value represents and any important cases]
 * @throws {ErrorType} [When and why this error is thrown]
 * 
 * @example
 * ```typescript
 * // Example usage for complex methods
 * await queue.add(file, { 
 *   lastReviewed: Date.now(),
 *   interval: 7 
 * });
 * ```
 */
async methodName(paramName: Type, anotherParam: Type): ReturnType {
  // ...
}
```

### Example: Core Algorithm

```typescript
/**
 * Calculate next review interval using SuperMemo 2.0 algorithm
 * 
 * SuperMemo 2.0 adjusts intervals based on recall quality:
 * - Score < 3: Reset to minimum interval (failed recall)
 * - Score >= 3: Multiply interval by ease factor (successful recall)
 * 
 * The ease factor is adjusted after each review to personalize the schedule:
 * - Higher scores increase ease factor (easier material)
 * - Lower scores decrease ease factor (harder material)
 * 
 * Formula: newInterval = oldInterval * easeFactor
 * Ease adjustment: newEase = oldEase + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
 * 
 * @param currentInterval - Current interval in days
 * @param currentEaseFactor - Current ease factor (typically 1.3 to 3.0)
 * @param score - Review quality score (0-5, where 0=total blackout, 5=perfect recall)
 * @param minInterval - Minimum interval for failed reviews (default: 1 day)
 * @param maxInterval - Maximum interval to prevent forgetting (default: 365 days)
 * @returns Object containing new interval in days and adjusted ease factor
 * 
 * @example
 * ```typescript
 * // Successful review (score 4, good recall)
 * const result = updateInterval(7, 2.5, 4);
 * // result: { interval: 17.5, easeFactor: 2.5 } (interval grew by 2.5x)
 * 
 * // Failed review (score 1, couldn't recall)
 * const result = updateInterval(7, 2.5, 1);
 * // result: { interval: 1, easeFactor: 2.18 } (reset to minimum)
 * ```
 */
updateInterval(
  currentInterval: number,
  currentEaseFactor: number,
  score: number,
  minInterval: number = 1,
  maxInterval: number = 365
): { interval: number; easeFactor: number } {
  // Implementation...
}
```

### Example: Integration Method

```typescript
/**
 * Queue a frontmatter update for a specific file
 * 
 * Updates are not applied immediately to avoid race conditions with
 * Obsidian's file save events. When users edit files, Obsidian fires
 * multiple save events in rapid succession. If we update frontmatter
 * immediately, later events can overwrite our changes.
 * 
 * This queue batches updates by file path and deduplicates them using
 * Object.assign. Multiple updates to the same file are merged before
 * being written to disk.
 * 
 * @param file - The note file to update (TFile from Obsidian API)
 * @param updates - Frontmatter properties to add or modify (use undefined to delete)
 * @returns Promise that resolves when update is queued (not when applied)
 * 
 * @example
 * ```typescript
 * // Queue review timestamp update
 * await queue.add(file, { lastReviewed: Date.now() });
 * 
 * // Queue multiple property updates
 * await queue.add(file, { 
 *   lastReviewed: Date.now(),
 *   interval: 7,
 *   easeFactor: 2.5 
 * });
 * 
 * // Delete a property by setting to undefined
 * await queue.add(file, { oldProperty: undefined });
 * 
 * // Process the queue to apply changes
 * await queue.process();
 * ```
 */
async add(file: TFile, updates: Partial<Record<string, any>>): Promise<void> {
  // Implementation...
}
```

### Example: Complex Business Logic

```typescript
/**
 * Filter notes by active contexts, handling edge cases
 * 
 * Context filtering has several non-obvious edge cases:
 * 1. If no contexts exist in settings, include all notes
 * 2. If all contexts are inactive, include all notes (prevents empty reviews)
 * 3. Notes with no context property always match (for backward compatibility)
 * 4. Notes match if they have any active context (OR logic, not AND)
 * 
 * This ensures users can always review notes even if they haven't
 * configured contexts yet, and prevents accidental exclusion of all notes.
 * 
 * @param notes - Array of note files to filter
 * @param contexts - Array of context configurations from settings
 * @returns Filtered array of notes matching active contexts
 * 
 * @example
 * ```typescript
 * // All contexts inactive -> returns all notes
 * const notes = filterNotesByContext(allNotes, [
 *   { name: 'learning', isActive: false },
 *   { name: 'reference', isActive: false }
 * ]);
 * 
 * // Only 'learning' active -> returns notes with learning context + notes with no context
 * const notes = filterNotesByContext(allNotes, [
 *   { name: 'learning', isActive: true },
 *   { name: 'reference', isActive: false }
 * ]);
 * ```
 */
filterNotesByContext(notes: TFile[], contexts: Context[]): TFile[] {
  // Implementation...
}
```

### Anti-Pattern

```typescript
/**
 * Update interval
 * @param interval - interval
 * @param easeFactor - ease factor
 * @param score - score
 */
updateInterval(interval: number, easeFactor: number, score: number) {
  // ...
}
```

**Why this is bad:**
- Doesn't explain what the method does or why it exists
- Parameter descriptions just restate the names
- No explanation of the algorithm or formula
- No context about SuperMemo 2.0
- No indication of what values are valid for score
- No explanation of return value

## Inline Comment Standards

### When to Use Inline Comments

**Good Reasons:**
- **Explaining complex logic:** "Binary search works here because array is pre-sorted by lastReviewed"
- **Non-obvious decisions:** "Check parent folders because Obsidian doesn't normalize paths"
- **Performance optimizations:** "Cache this lookup to avoid O(n²) behavior in large vaults"
- **Workarounds:** "Manual delay needed because Obsidian API doesn't await vault updates"
- **Algorithm steps:** "SuperMemo 2.0: adjust ease factor based on recall quality"
- **Edge cases:** "Handle undefined separately because it means 'delete this property'"
- **Domain knowledge:** "Score < 3 means failed recall, reset to minimum interval"

### When NOT to Use Inline Comments

**Bad Reasons:**
- **Restating code:** "Increment counter" for `counter++`
- **Obvious operations:** "Call the function" for `doSomething()`
- **Type information:** "x is a number" when TypeScript already says this
- **Redundant JSDoc:** Repeating what's already in method documentation

### Inline Comment Format

```typescript
// [Complete sentence explaining WHY, not WHAT]
// [Continue explanation on next line if needed]
const result = complexOperation();

// For longer explanations or multi-part logic:
/*
 * [Explanation of complex section]
 * [Why this approach was chosen]
 * [Any important caveats or edge cases]
 */
```

### Examples: Algorithm Explanation

**Good:**
```typescript
// SuperMemo 2.0: Score < 3 indicates failed recall
// Reset interval to minimum and reduce ease factor to make future reviews easier
if (score < 3) {
  interval = minInterval;
  easeFactor = Math.max(1.3, easeFactor - 0.2);
}
```

**Bad:**
```typescript
// Check if score is less than 3
if (score < 3) {
  // Set interval to minimum
  interval = minInterval;
  // Adjust ease factor
  easeFactor = Math.max(1.3, easeFactor - 0.2);
}
```

### Examples: Integration Pattern

**Good:**
```typescript
// Queue is processed in requestAnimationFrame to batch rapid updates
// that occur during user typing, preventing UI jank from frequent file writes
this.processQueue();
```

**Bad:**
```typescript
// Process the queue
this.processQueue();
```

### Examples: Edge Case Handling

**Good:**
```typescript
// Notes with no context property should always be included for backward compatibility
// with vaults that predate the contexts feature
if (!note.frontmatter?.context) {
  return true;
}
```

**Bad:**
```typescript
// Check if note has no context
if (!note.frontmatter?.context) {
  return true;
}
```

### Examples: Performance Consideration

**Good:**
```typescript
// Cache the metadata lookup to avoid repeated file system access
// in the context filter loop (can save 100s of ms in large vaults)
const metadata = this.app.metadataCache.getFileCache(file);
```

**Bad:**
```typescript
// Get the metadata
const metadata = this.app.metadataCache.getFileCache(file);
```

### TODO/FIXME Format

```typescript
// TODO: Add support for custom spacing algorithms beyond SuperMemo 2.0
// Context: Users have requested Anki-style FSRS algorithm
// Priority: Medium - nice to have but not blocking current users
// Issue: #42

// FIXME: Race condition when vault renames happen during queue processing
// Context: Occurs rarely but can lose frontmatter updates
// Impact: Low - only affects users who rename files during active reviews
// Reproduce: Rename file while queue.add() is pending but not yet processed
// Issue: #67
```

### Magic Numbers and Constants

**Always explain magic numbers:**
```typescript
// SuperMemo 2.0 constants from original paper:
// 0.1 = base ease adjustment per review
// 0.08 = primary difficulty scaling factor  
// 0.02 = secondary difficulty scaling factor
// These were empirically derived by Piotr Woźniak
const easeAdjustment = 0.1 - (5 - score) * (0.08 + (5 - score) * 0.02);
```

## Type Documentation Standards

### Type Alias Documentation

```typescript
/**
 * [What this type represents in domain terms]
 * 
 * [Why this type exists and when to use it]
 * [Any constraints or valid values]
 * 
 * @example
 * ```typescript
 * // Example of valid values
 * const context: NoteContext = 'learning';
 * ```
 */
type TypeName = [definition];
```

### Enum Documentation

```typescript
/**
 * [What this enum represents]
 * 
 * [When to use it and how values relate to each other]
 */
enum EnumName {
  /**
   * [What this value means]
   * [When to use this value]
   * [Effect on behavior if relevant]
   */
  VALUE_ONE = 0,
  
  /**
   * [What this value means]
   * [When to use this value]
   * [Effect on behavior if relevant]
   */
  VALUE_TWO = 1,
}
```

### Example: Domain Type

```typescript
/**
 * Review quality scores for SuperMemo 2.0 algorithm
 * 
 * These scores map to recall quality and determine how intervals change:
 * - 0-2: Failed recall, interval resets to minimum
 * - 3-5: Successful recall, interval grows by ease factor
 * 
 * Higher scores also increase the ease factor, making future intervals
 * grow faster for material that's easy to remember.
 * 
 * @example
 * ```typescript
 * // Perfect recall
 * const score: ReviewQuality = 5;
 * 
 * // Struggled but eventually recalled
 * const score: ReviewQuality = 3;
 * 
 * // Complete blackout, no recall
 * const score: ReviewQuality = 0;
 * ```
 */
type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
```

### Example: Complex Interface

```typescript
/**
 * Context - A group of notes with independent review schedules
 * 
 * Contexts allow users to organize notes into separate review queues.
 * For example, language learning notes might be reviewed daily with
 * aggressive spacing, while reference notes are reviewed monthly.
 * 
 * Each context has its own spacing method configuration and can be
 * toggled active/inactive to temporarily pause reviews.
 */
interface Context {
  /**
   * Unique identifier for this context
   * Used in note frontmatter to link notes to contexts
   */
  name: string;
  
  /**
   * Whether this context is currently active for reviews
   * Inactive contexts are excluded from the review queue
   * Default: true
   */
  isActive: boolean;
  
  /**
   * Spacing algorithm and parameters for this context
   * If not specified, falls back to default method from settings
   */
  spacingMethodName?: string;
  
  /**
   * Custom review options for this context
   * Overrides default review options if provided
   */
  reviewOptions?: ReviewOption[];
}
```

### Example: Settings Interface

```typescript
/**
 * SpacedEverythingPluginSettings - Plugin configuration
 * 
 * These settings control all aspects of the spaced repetition system.
 * They are persisted in Obsidian's plugin data storage and can be
 * modified through the plugin settings tab.
 * 
 * Settings are organized into sections:
 * - General: Basic plugin behavior
 * - Spacing: Algorithm and interval configuration  
 * - Contexts: Review queue organization
 * - Review: Options presented during review
 * - Logging: Privacy-conscious activity logging
 */
interface SpacedEverythingPluginSettings {
  /**
   * Folder path for new notes created during review
   * Supports template variables: {{date}}, {{time}}, {{unixtime}}
   * Default: 'SpacedEverything/{{date}}'
   */
  targetFolder: string;
  
  /**
   * Default spacing method for notes without a specific context
   * Defines algorithm and parameters for interval calculation
   */
  defaultSpacingMethod: SpacingMethod;
  
  /**
   * Array of contexts for organizing notes into review queues
   * Empty array means all notes share the default spacing method
   */
  contexts: Context[];
  
  /**
   * Review options shown to user during review workflow
   * Each option has a label and score that affects interval calculation
   */
  reviewOptions: ReviewOption[];
  
  /**
   * Path to JSONL log file for review activity
   * Empty string disables logging
   * Default: '' (disabled)
   */
  logFilePath: string;
  
  /**
   * Frontmatter properties to include in logs
   * Use ['*'] to log all properties
   * Use [] to log no properties (most private)
   * Default: [] (privacy-first approach)
   */
  logProperties: string[];
}
```

## Documentation Templates

### File Header Template

```typescript
/**
 * [FileName] - [One-sentence purpose]
 * 
 * [2-3 sentences explaining:
 *  - Why this module exists and what problem it solves
 *  - How it fits into the larger architecture
 *  - Any critical design decisions or constraints]
 * 
 * Key exports: [List main exports if not obvious]
 * Dependencies: [Note unusual or important dependencies]
 * Integration: [Note Obsidian-specific patterns if applicable]
 */
```

### Class Template

```typescript
/**
 * [ClassName] - [Purpose and primary responsibility]
 * 
 * [2-4 sentences explaining:
 *  - What role this class plays in the system
 *  - Key responsibilities and constraints
 *  - Important lifecycle or usage patterns
 *  - Any critical design decisions]
 * 
 * @example
 * ```typescript
 * // Show typical usage pattern
 * const instance = new ClassName(dependencies);
 * await instance.mainMethod(params);
 * ```
 */
export class ClassName {
  /**
   * [Constructor purpose and what it configures]
   * @param param - [What it configures or initializes]
   */
  constructor(param: Type) {}
  
  /**
   * [Method purpose and why it exists]
   * 
   * [Additional context or important details]
   * 
   * @param param - [What it represents in domain terms]
   * @returns [What the result represents]
   */
  public method(param: Type): ReturnType {}
}
```

### Function Template

```typescript
/**
 * [What the function does and why it exists]
 * 
 * [2-3 sentences providing:
 *  - Additional context or important details
 *  - Side effects or edge cases
 *  - Performance considerations if relevant]
 * 
 * @param param - [What it represents, not just type]
 * @returns [What the result represents]
 * 
 * @example
 * ```typescript
 * // Example usage for complex functions
 * const result = functionName(exampleValue);
 * ```
 */
export function functionName(param: Type): ReturnType {
  // ...
}
```

### Interface Template

```typescript
/**
 * [InterfaceName] - [What this interface represents]
 * 
 * [2-3 sentences explaining:
 *  - The domain concept this models
 *  - When and why to use this interface
 *  - Any important constraints or relationships]
 */
interface InterfaceName {
  /**
   * [Property description explaining what it represents]
   * [Additional context: constraints, valid ranges, when optional/required]
   */
  propertyName: type;
}
```

## Obsidian-Specific Documentation

### MetadataCache Patterns

When using Obsidian's MetadataCache, always document:

```typescript
/**
 * Get cached metadata for a file
 * 
 * Uses Obsidian's MetadataCache which provides fast access to parsed
 * frontmatter and file structure. The cache is automatically updated
 * when files change, but there's a brief delay during which it may
 * be stale.
 * 
 * For this plugin, stale cache is acceptable because we're querying
 * review timestamps that change infrequently. If you need guaranteed
 * fresh data, use vault.read() instead (much slower).
 * 
 * @param file - File to get metadata for
 * @returns Cached metadata or null if file not yet indexed
 */
getMetadata(file: TFile): CachedMetadata | null {
  return this.app.metadataCache.getFileCache(file);
}
```

### Frontmatter Update Patterns

When updating frontmatter, always document the race condition concern:

```typescript
/**
 * Update note frontmatter using the queue
 * 
 * IMPORTANT: Never use vault.modify() or vault.process() directly
 * for frontmatter updates. Obsidian fires multiple save events when
 * users edit files, which creates race conditions that can corrupt
 * or lose data.
 * 
 * Always use the queue pattern:
 * 1. Add updates to queue (deduplicates by file path)
 * 2. Call queue.process() to apply atomically
 * 
 * @param file - File to update
 * @param updates - Frontmatter properties to add or modify
 */
async queueFrontmatterUpdate(file: TFile, updates: Record<string, any>): Promise<void> {
  await this.frontmatterQueue.add(file, updates);
  await this.frontmatterQueue.process();
}
```

### Workspace API Patterns

When using Workspace API, document leaf vs pane behavior:

```typescript
/**
 * Open file in a new leaf (tab or pane)
 * 
 * Obsidian's workspace API has several leaf types:
 * - 'tab': Opens in new tab in current pane (default)
 * - 'split': Opens in vertical split
 * - 'window': Opens in new window
 * 
 * This plugin uses 'tab' to avoid disrupting user's layout.
 * The leaf is focused automatically so keyboard shortcuts work
 * immediately after opening.
 * 
 * @param file - File to open
 * @returns Promise that resolves when file is opened and focused
 */
async openFile(file: TFile): Promise<void> {
  const leaf = this.app.workspace.getLeaf('tab');
  await leaf.openFile(file);
  this.app.workspace.setActiveLeaf(leaf, { focus: true });
}
```

## Anti-Patterns to Avoid

### Useless Comments

❌ **Bad:**
```typescript
// Increment counter
counter++;

// Call the function
doSomething();

// Return the value
return value;

// Loop through array
for (const item of items) {
```

✅ **Better:** No comment needed—code is self-explanatory

### Commenting What Instead of Why

❌ **Bad:**
```typescript
// Set last reviewed to current time
note.frontmatter.lastReviewed = Date.now();
```

✅ **Better:**
```typescript
// Track review time to calculate next interval using SM-2 algorithm
note.frontmatter.lastReviewed = Date.now();
```

### Outdated Comments

❌ **Bad:**
```typescript
// Process all files in the vault
// [Code has changed but comment hasn't been updated]
await this.processRecentFiles(limit);
```

✅ **Better:** Keep comments synchronized with code changes, or remove if no longer accurate

### Redundant JSDoc

❌ **Bad:**
```typescript
/**
 * Get the file
 * @param path - the path
 * @returns the file
 */
getFile(path: string): TFile
```

✅ **Better:**
```typescript
/**
 * Resolve a file path to a TFile object, returning null if the file
 * doesn't exist or is not a markdown file
 * 
 * @param path - Vault-relative path (e.g., 'folder/note.md')
 * @returns File object or null if not found or not markdown
 */
getFile(path: string): TFile | null
```

### Over-Commenting Simple Code

❌ **Bad:**
```typescript
// Create a new array
const items = [];

// Loop through each item
for (const item of data) {
  // Add item to array
  items.push(item);
}

// Return the array
return items;
```

✅ **Better:**
```typescript
// Filter data to include only items matching active contexts
const items = [];
for (const item of data) {
  items.push(item);
}
return items;
```

Or even better, no comments if code is self-explanatory:
```typescript
return data.filter(item => matchesActiveContext(item));
```

## Quality Checklist

Before considering documentation complete, verify:

### File-Level
- [ ] File header explains module purpose and architecture role
- [ ] Key exports are listed if not obvious
- [ ] Dependencies are noted if unusual
- [ ] Obsidian integration patterns are explained

### Class/Interface-Level
- [ ] Purpose and responsibilities are clear
- [ ] Usage examples provided for complex classes
- [ ] All properties have meaningful descriptions
- [ ] Relationships to other types are explained

### Method/Function-Level
- [ ] Purpose explains "why" not just "what"
- [ ] Parameters are described in domain terms
- [ ] Return values are explained
- [ ] Side effects are documented
- [ ] Edge cases are mentioned
- [ ] Complex methods have usage examples

### Inline Comments
- [ ] Comments explain "why" not "what"
- [ ] Complex algorithms are explained
- [ ] Magic numbers are justified
- [ ] Edge cases are noted
- [ ] No redundant or outdated comments
- [ ] TODOs include context and priority

### Obsidian Integration
- [ ] MetadataCache usage is explained
- [ ] Race condition prevention is documented
- [ ] Workspace API patterns are clear
- [ ] Modal lifecycle is explained

### Overall Quality
- [ ] Documentation is clear and concise
- [ ] Technical accuracy is verified
- [ ] Examples are helpful and correct
- [ ] No unnecessary jargon
- [ ] Consistent terminology throughout

## Documentation Maintenance

### When Code Changes

Documentation should be updated when:
- Adding new public methods or classes
- Changing method signatures or return types
- Modifying algorithm behavior
- Adding or changing edge case handling
- Refactoring architecture
- Fixing bugs that affect documented behavior

### Review Process

Before committing documentation changes:
1. **Verify technical accuracy** - Ensure documentation matches implementation
2. **Check examples** - Verify code examples compile and run correctly
3. **Review clarity** - Read as if you're unfamiliar with the code
4. **Validate completeness** - Ensure all required sections are present
5. **Update related docs** - Keep README and guides in sync

### Common Mistakes

**Mistake 1: Documentation lags behind code**
- Solution: Update documentation in the same commit as code changes
- Use git hooks to remind developers to update docs

**Mistake 2: Copy-pasted documentation**
- Solution: Customize each comment for its specific context
- Don't reuse generic templates without modification

**Mistake 3: Over-documenting trivial code**
- Solution: Focus on complex and non-obvious sections
- Trust readers to understand basic TypeScript

**Mistake 4: Under-documenting integration points**
- Solution: Always explain Obsidian API usage
- Document why patterns were chosen

## Next Steps

These standards will guide the documentation improvement process in subsequent workflows:

1. **Improvement Plan** (Next workflow: `docs-05-improvement-plan.md`)
   - Prioritize which files and functions to document first
   - Create concrete tasks based on these standards
   - Estimate time and effort for each improvement
   - Define success criteria for documentation quality

2. **Implementation**
   - Apply these standards systematically to the codebase
   - Start with critical gaps (SuperMemo 2.0, context filtering)
   - Move to important gaps (public APIs, complex classes)
   - Address nice-to-have improvements as time permits

3. **Review and Refinement**
   - Validate documentation with users and contributors
   - Iterate on standards based on feedback
   - Update examples as patterns evolve
   - Maintain consistency across the codebase

## Appendix: Good Documentation Examples

### Example 1: Well-Documented Algorithm

```typescript
/**
 * Calculate next review interval using SuperMemo 2.0 algorithm
 * 
 * SuperMemo 2.0 is a spaced repetition algorithm that adjusts review
 * intervals based on how well the user recalls information. It uses
 * two key metrics:
 * 
 * 1. Interval: Days between reviews (grows with successful recalls)
 * 2. Ease Factor: Multiplier determining how fast intervals grow
 * 
 * Algorithm behavior:
 * - Score 0-2: Failed recall → reset to minInterval, reduce ease
 * - Score 3-5: Successful recall → multiply interval by ease factor
 * 
 * The ease factor adjusts based on review quality:
 * - Perfect recall (5): Increases ease (material is easy)
 * - Difficult recall (3): Decreases ease (material is hard)
 * 
 * Formula details:
 * - newInterval = oldInterval * easeFactor (capped at maxInterval)
 * - easeAdjustment = 0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)
 * - newEase = oldEase + easeAdjustment (minimum 1.3)
 * 
 * Constants are from the original SuperMemo 2.0 paper by Piotr Woźniak.
 * 
 * @param currentInterval - Current interval in days (must be positive)
 * @param currentEaseFactor - Current ease factor (typically 1.3 to 3.0)
 * @param score - Review quality (0=blackout, 3=recalled with difficulty, 5=perfect)
 * @param minInterval - Minimum interval for failed reviews (default: 1 day)
 * @param maxInterval - Cap to prevent intervals from growing too large (default: 365 days)
 * @returns Object with new interval (in days) and adjusted ease factor
 * 
 * @example
 * ```typescript
 * // First review, user recalls perfectly (score 5)
 * const result = updateInterval(1, 2.5, 5, 1, 365);
 * // result: { interval: 2.5, easeFactor: 2.6 }
 * // Interval multiplied by ease, ease increased slightly
 * 
 * // Later review, user struggles (score 3)
 * const result = updateInterval(7, 2.5, 3, 1, 365);
 * // result: { interval: 17.5, easeFactor: 2.36 }
 * // Interval still grows but ease decreases (material is harder)
 * 
 * // Failed review (score 1)
 * const result = updateInterval(7, 2.5, 1, 1, 365);
 * // result: { interval: 1, easeFactor: 2.18 }
 * // Reset to minimum, ease reduced significantly
 * ```
 */
updateInterval(
  currentInterval: number,
  currentEaseFactor: number,
  score: number,
  minInterval: number = 1,
  maxInterval: number = 365
): { interval: number; easeFactor: number } {
  // SuperMemo 2.0: Failed recall (score < 3) resets interval to minimum
  if (score < 3) {
    // Reduce ease factor to make future reviews easier
    // Ensure ease doesn't drop below 1.3 (algorithm constraint)
    const newEase = Math.max(1.3, currentEaseFactor - 0.2);
    return { interval: minInterval, easeFactor: newEase };
  }
  
  // Calculate ease factor adjustment based on recall quality
  // Higher scores increase ease, lower scores decrease it
  // Formula from original SM-2 paper:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const easeAdjustment = 0.1 - (5 - score) * (0.08 + (5 - score) * 0.02);
  const newEase = Math.max(1.3, currentEaseFactor + easeAdjustment);
  
  // Multiply interval by ease factor (successful recall)
  // Cap at maxInterval to prevent forgetting
  const newInterval = Math.min(currentInterval * newEase, maxInterval);
  
  return { interval: Math.round(newInterval), easeFactor: newEase };
}
```

### Example 2: Well-Documented Integration Pattern

```typescript
/**
 * FrontmatterQueue - Batched frontmatter update manager
 * 
 * Obsidian's file system events create race conditions that can corrupt
 * frontmatter if updates are applied immediately. When users edit files,
 * Obsidian fires multiple 'modify' events in rapid succession. If we
 * update frontmatter in response to each event, later events can overwrite
 * our changes, resulting in data loss.
 * 
 * This queue solves the problem by:
 * 1. Batching updates by file path
 * 2. Deduplicating updates using Object.assign
 * 3. Applying updates atomically via processFrontMatter
 * 
 * The queue guarantees that only the final merged state is written to disk,
 * preventing data corruption and ensuring consistency.
 * 
 * Usage pattern:
 * ```typescript
 * // Queue multiple updates
 * await queue.add(file, { lastReviewed: Date.now() });
 * await queue.add(file, { interval: 7 }); // Merged with previous
 * 
 * // Apply all queued updates atomically
 * await queue.process();
 * ```
 * 
 * Key exports: FrontmatterQueue class
 * Dependencies: Obsidian Vault API (processFrontMatter)
 * Integration: Wraps Obsidian's callback-based API with Promises
 */
export class FrontmatterQueue {
  private queue: Map<string, Record<string, any>> = new Map();
  private vault: Vault;
  
  /**
   * Create a new frontmatter queue
   * @param vault - Obsidian vault for file operations
   */
  constructor(vault: Vault) {
    this.vault = vault;
  }
  
  /**
   * Queue frontmatter updates for a file
   * 
   * Updates are merged with any existing queued updates for the same file.
   * If the same property is updated multiple times, the last value wins.
   * 
   * Special case: Setting a property to undefined deletes it from frontmatter.
   * 
   * @param file - File to update
   * @param updates - Properties to add/modify (undefined = delete)
   * 
   * @example
   * ```typescript
   * // Add new property
   * await queue.add(file, { lastReviewed: Date.now() });
   * 
   * // Update multiple properties
   * await queue.add(file, { 
   *   interval: 7,
   *   easeFactor: 2.5 
   * });
   * 
   * // Delete property by setting to undefined
   * await queue.add(file, { oldProperty: undefined });
   * ```
   */
  async add(file: TFile, updates: Record<string, any>): Promise<void> {
    const existing = this.queue.get(file.path) || {};
    
    // Merge updates with existing queue entry
    // Later values overwrite earlier ones
    this.queue.set(file.path, { ...existing, ...updates });
  }
  
  /**
   * Apply all queued updates atomically
   * 
   * Processes each file in the queue, applying merged updates through
   * Obsidian's processFrontMatter API. This ensures updates are atomic
   * and don't conflict with concurrent file modifications.
   * 
   * The queue is cleared after successful processing.
   * 
   * @returns Promise that resolves when all updates are applied
   */
  async process(): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [path, updates] of this.queue) {
      const file = this.vault.getAbstractFileByPath(path);
      
      if (file instanceof TFile) {
        // Process frontmatter atomically using Obsidian API
        // This handles file locking and race condition prevention
        const promise = this.updateFrontmatter(file, updates);
        promises.push(promise);
      }
    }
    
    // Wait for all updates to complete
    await Promise.all(promises);
    
    // Clear queue after successful processing
    this.queue.clear();
  }
  
  /**
   * Update frontmatter for a single file
   * 
   * Wraps Obsidian's callback-based processFrontMatter API with a Promise.
   * The callback receives current frontmatter and returns updated frontmatter.
   * 
   * Properties set to undefined are deleted from frontmatter.
   * 
   * @param file - File to update
   * @param updates - Properties to apply
   * @returns Promise that resolves when update completes
   */
  private async updateFrontmatter(
    file: TFile,
    updates: Record<string, any>
  ): Promise<void> {
    return new Promise((resolve) => {
      this.vault.processFrontMatter(file, (frontmatter) => {
        // Apply each update to frontmatter
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined) {
            // Delete property if value is undefined
            delete frontmatter[key];
          } else {
            // Add or update property
            frontmatter[key] = value;
          }
        }
        
        // Resolve promise when processFrontMatter completes
        resolve();
      });
    });
  }
}
```

## Summary

These documentation standards are designed specifically for the Spaced Everything plugin, balancing:

1. **Clarity** - Making complex algorithms and integration patterns understandable
2. **Practicality** - Focusing on high-value documentation over comprehensive coverage
3. **Maintainability** - Keeping documentation synchronized with code changes
4. **Accessibility** - Supporting contributors of varying familiarity with Obsidian

By following these standards, we ensure that:
- Users can understand features and workflows
- Plugin developers can understand Obsidian integration patterns
- Contributors can understand architecture and business logic
- Future maintainers can understand why decisions were made

The next step is to create an improvement plan that prioritizes applying these standards to the codebase, starting with the most critical gaps identified in the documentation audit.
