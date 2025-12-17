# Codebase Map

**Generated:** 2025-12-18  
**Based On:** Project Overview v1.0  
**Purpose:** Detailed mapping of source code structure and relationships

## File Inventory

Quick reference list of all source files:

| File | Primary Responsibility | Key Exports |
|------|----------------------|-------------|
| types.ts | Type definitions | Context, ReviewOption, SpacingMethod interfaces |
| suggester.ts | User selection UI | Suggester class, suggester() function |
| frontmatterQueue.ts | Batch frontmatter updates | FrontmatterQueue class |
| logger.ts | Activity logging | Logger class |
| settings.ts | Plugin configuration UI | SpacedEverythingSettingTab, SpacedEverythingPluginSettings |
| main.ts | Plugin entry point & core logic | SpacedEverythingPlugin (default) |

## Module Details

### types.ts

**Path:** `src/types.ts`  
**Purpose:** Centralized type definitions for the plugin's core data structures

**Responsibility:** Defines TypeScript interfaces that represent the plugin's configuration and domain models. This file has no runtime code, only type definitions.

**Key Exports:**
- **Context** - Represents a categorization context for notes
  - `name: string` - The context name
  - `isActive: boolean` - Whether the context is currently active for filtering
  - `spacingMethodName?: string` - Optional association to a spacing method
- **ReviewOption** - Represents a review outcome option
  - `name: string` - Display name (e.g., "Fruitful", "Ignore")
  - `score: number` - Numeric score used in spacing algorithm (0-5 for SuperMemo 2.0)
- **SpacingMethod** - Configuration for a spacing algorithm
  - `name: string` - Method name
  - `spacingAlgorithm: string` - Algorithm type ("SuperMemo2.0" or "Custom")
  - `customScriptFileName: string` - Path to custom script (not yet implemented)
  - `reviewOptions: ReviewOption[]` - Available review options
  - `defaultInterval: number` - Initial interval in days
  - `defaultEaseFactor?: number` - Initial ease factor (SuperMemo 2.0 specific)

**Dependencies:**
- **Internal:** None
- **External:** None
- **Obsidian API:** None

**Dependents:**
- `main.ts` - Uses all interfaces
- `settings.ts` - Uses all interfaces
- `logger.ts` - Indirectly through settings interface

**Code Patterns:**
- Interface-only module (no runtime code)
- Optional properties for algorithm-specific fields
- Domain-driven design - types reflect business concepts

**Notable Implementation Details:**
- `defaultEaseFactor` is optional because it's only relevant for SuperMemo 2.0 algorithm
- Interfaces are kept simple and focused on data structure, not behavior

---

### suggester.ts

**Path:** `src/suggester.ts`  
**Purpose:** Provides a reusable modal interface for user selection from a list of options

**Responsibility:** Wraps Obsidian's SuggestModal API to provide a promise-based user selection interface. Used throughout the plugin for choosing contexts, spacing methods, review options, etc.

**Key Exports:**
- **Suggester** - Modal class that displays filterable suggestions
  - `constructor(app: App, promptText: string, items: string[])` - Initialize with app, prompt, and options
  - `getSuggestions(query: string): string[]` - Filters items based on user query
  - `renderSuggestion(item: string, el: HTMLElement)` - Renders each suggestion
  - `onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent)` - Handles selection
- **suggester()** - Helper function that wraps Suggester in a Promise
  - `suggester(options: string[], promptText: string): Promise<string | null>` - Returns selected option or null

**Dependencies:**
- **Internal:** None
- **External:** None
- **Obsidian API:**
  - `App` - Obsidian application instance
  - `SuggestModal` - Base class for suggestion modals

**Dependents:**
- `main.ts` - Uses suggester() function extensively for user selections

**Code Patterns:**
- Extends Obsidian's SuggestModal class
- Promise-based wrapper pattern for async user interaction
- Fuzzy search filtering (case-insensitive substring matching)

**Notable Implementation Details:**
- The `suggester()` function provides a cleaner async/await interface than using the class directly
- Returns `null` if user cancels (Esc key)
- Simple substring filtering on lowercase strings for search

---

### frontmatterQueue.ts

**Path:** `src/frontmatterQueue.ts`  
**Purpose:** Batch and deduplicate frontmatter updates to prevent race conditions

**Responsibility:** Collects multiple frontmatter update requests for the same file and processes them in a single atomic operation. This prevents conflicts when multiple commands need to update the same note's metadata.

**Key Exports:**
- **FrontmatterQueue** - Queue manager for batching frontmatter updates
  - `constructor(app: App)` - Initialize with Obsidian app instance
  - `add(file: TFile, updates: Record<string, any>)` - Queue updates for a file
  - `process()` - Apply all queued updates and clear queue
  - `updateFrontmatter(file: TFile, updates: Record<string, any>)` - Private method that applies updates

**Dependencies:**
- **Internal:** None
- **External:** None
- **Obsidian API:**
  - `TFile` - Represents a file in the vault
  - `App` - Obsidian application instance (for fileManager.processFrontMatter)

**Dependents:**
- `main.ts` - Creates instance and uses for all frontmatter updates

**Code Patterns:**
- Queue pattern for batching operations
- Map data structure keyed by file path for deduplication
- Promise-based async processing
- Special handling: `undefined` values delete properties

**Notable Implementation Details:**
- Multiple updates to the same file are merged before processing
- Uses `Object.assign()` to merge updates, so later updates override earlier ones
- Deletes frontmatter properties when value is `undefined`
- Wraps Obsidian's `processFrontMatter` in a Promise for async/await compatibility
- Queue is cleared after processing

---

### logger.ts

**Path:** `src/logger.ts`  
**Purpose:** Structured logging of plugin activity to a JSONL file

**Responsibility:** Captures plugin actions (onboard, remove, review) and writes structured JSON logs. Respects user privacy settings for what data to include.

**Key Exports:**
- **Logger** - Logging service class
  - `constructor(app: App, settings: SpacedEverythingPluginSettings)` - Initialize with app and settings
  - `log(action, file, frontmatter?, reviewScore?, newInterval?, newEaseFactor?)` - Main logging method
  - `generateLogData(...)` - Private method to construct log entry
  - `appendToLogFile(logData: string)` - Private method to write to log file

**Dependencies:**
- **Internal:**
  - `settings.ts` - SpacedEverythingPluginSettings interface
- **External:** None
- **Obsidian API:**
  - `TFile` - File being logged
  - `App` - For vault operations

**Dependents:**
- `main.ts` - Creates Logger instance, calls log() method

**Code Patterns:**
- Service class pattern (injected dependencies)
- JSONL format (newline-delimited JSON)
- Configurable logging (respects user settings)
- Graceful error handling (catches and logs errors, doesn't throw)

**Notable Implementation Details:**
- Early return if `logFilePath` is empty (logging disabled)
- Creates log file if it doesn't exist
- Each log entry is a JSON object on a single line (JSONL format)
- Conditional inclusion of data based on settings:
  - Note title (if `logNoteTitle` enabled)
  - Frontmatter properties (all if `*`, or specific list)
  - Review-specific data (score, interval, ease factor)
- Timestamps always included in ISO format
- Error logging to console but doesn't crash plugin

---

### settings.ts

**Path:** `src/settings.ts`  
**Purpose:** Plugin settings UI and configuration management

**Responsibility:** Defines the settings interface and provides the Obsidian settings tab UI. Handles user interactions for configuring spacing methods, contexts, logging, thought capture, and bulk onboarding.

**Key Exports:**
- **SpacedEverythingPluginSettings** - Interface defining all plugin settings (type export)
  - Logging settings (`logFilePath`, `logOnboardAction`, etc.)
  - Spacing methods array
  - Contexts array
  - Thought capture templates
  - Onboarding exclusion folders
  - Timestamp timezone preference
- **SpacedEverythingSettingTab** - Settings tab UI (extends PluginSettingTab)
  - `constructor(app: App, plugin: SpacedEverythingPlugin)` - Initialize tab
  - `display()` - Render the entire settings UI
  - `renderSpacingMethodSetting()` - Render a spacing method configuration
  - `renderContextSetting()` - Render a context configuration
  - `renderReviewOptionSetting()` - Render a review option configuration
  - `showConfirmationModal()` - Show bulk onboarding confirmation
  - `addFrontMatterPropertiesToAllNotes()` - Bulk onboard all notes
  - `isFileExcluded()` - Check if file should be excluded from onboarding
  - `addFrontMatterPropertiesToNote()` - Onboard a single note

**Dependencies:**
- **Internal:**
  - `types.ts` - Context, ReviewOption, SpacingMethod interfaces
  - `main.ts` - SpacedEverythingPlugin class (circular dependency)
- **External:** None
- **Obsidian API:**
  - `App`, `Notice`, `PluginSettingTab`, `Setting`, `normalizePath`, `Modal`
  - `TAbstractFile`, `TFile`, `TFolder` - File system types

**Dependents:**
- `main.ts` - Imports settings interface and instantiates settings tab
- `logger.ts` - Uses settings interface

**Code Patterns:**
- Settings tab pattern (Obsidian standard)
- Dynamic UI generation (adds/removes settings based on arrays)
- Modal confirmation for destructive actions
- Circular dependency with main.ts (acceptable for settings)
- Conditional visibility of UI elements based on selection

**Notable Implementation Details:**
- Settings UI is organized into collapsible sections with headings
- Spacing methods support dynamic addition/removal (except can't delete last one)
- Review options are nested within spacing methods
- Contexts are independently managed with active/inactive toggle
- Custom script support for spacing algorithms is stubbed but not implemented
- Conditional display of settings based on algorithm choice (SuperMemo vs. Custom)
- Bulk onboarding feature with folder exclusion
- Links to external documentation in UI
- ConfirmationModal inner class for safety on bulk operations
- Path normalization for log file paths

---

### main.ts

**Path:** `src/main.ts`  
**Purpose:** Plugin entry point and core business logic

**Responsibility:** Coordinates all plugin functionality including spaced repetition logic, user commands, frontmatter management, thought capture, and plugin lifecycle. This is the main orchestrator that ties all other modules together.

**Key Exports:**
- **SpacedEverythingPlugin** - Main plugin class (default export, extends Plugin)
  - `onload()` - Plugin initialization
  - `onunload()` - Plugin cleanup
  - `loadSettings()` / `saveSettings()` - Settings persistence
  - **Command handlers:**
    - `logReviewOutcome()` - Process review and update interval
    - `openNextReviewItem()` - Open next due note
    - `toggleNoteContextsWrapper()` - Toggle contexts for current note
    - `captureThought()` - Capture quick thought to new note
    - `updateSpacingMethod()` - Change spacing method for note
  - **Core logic methods:**
    - `onboardNoteToSpacedEverything()` - Add note to system
    - `removeNoteFromSpacedEverything()` - Remove note from system
    - `updateInterval()` - Calculate new interval using SuperMemo 2.0
    - `getActiveSpacingMethod()` - Determine active method for note
    - `isNoteOnboarded()` - Check if note is in system
    - `filterNotesByContext()` - Filter notes by active contexts
  - **Helper methods:**
    - `formatTimestamp()` / `parseTimestamp()` - Timezone handling
    - `createNewNoteFile()` - Create note from thought
    - `generateUniqueFilePath()` - Prevent filename collisions
    - `processCapturedThoughtNewNoteContents()` - Template processing
    - And more...

**Dependencies:**
- **Internal:**
  - `types.ts` - All interfaces (Context, ReviewOption, SpacingMethod)
  - `logger.ts` - Logger class
  - `settings.ts` - Settings interface and tab
  - `suggester.ts` - Suggester class and function
  - `frontmatterQueue.ts` - FrontmatterQueue class
- **External:** None
- **Obsidian API:**
  - `App`, `Editor`, `MarkdownView`, `TFile`, `Notice`, `Plugin`, `Modal`

**Dependents:**
- `settings.ts` - Imports plugin class (circular dependency)

**Code Patterns:**
- Plugin pattern (Obsidian standard)
- Command pattern (Obsidian commands)
- Service coordination (coordinates logger, queue, suggester)
- SuperMemo 2.0 algorithm implementation
- Queue-based frontmatter updates (all updates queued, then processed)
- Modal UI for user input
- Template variable replacement ({{unixtime}}, {{date}}, {{time}}, {{thought}})

**Notable Implementation Details:**
- **DEFAULT_SETTINGS** constant defines initial configuration
- Plugin creates instances of Logger and FrontmatterQueue in `onload()`
- Commands registered for: review outcome, next item, toggle contexts, capture thought, update method
- **Frontmatter update pattern**: All updates use `queueFrontmatterUpdate()` followed by `processFrontmatterQueue()`
- **SuperMemo 2.0 algorithm** implemented in `updateInterval()`:
  - New ease factor: `prevEase + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))`
  - Min ease factor: 1.3
  - New interval: `max(1, prevInterval * newEaseFactor)`
  - Scores < 3 reset interval to 1 day
- **Timezone handling**: Supports UTC or Local timestamps with consistent parsing
- **Context filtering logic**:
  - No contexts defined → all notes included
  - All contexts inactive → no notes included
  - Notes with empty contexts → always included
  - Notes with at least one active context → included
- **Thought capture**: Creates notes with templates, handles variable replacement, adds to vault
- **Unique file naming**: Iteratively adds counters to prevent overwrites
- **Method fallback logic**: Falls back to first spacing method or context-based method

---

## Dependency Graph

```
main.ts (entry point)
├── types.ts (no dependencies)
├── logger.ts
│   └── settings.ts (interface)
│       ├── types.ts
│       └── main.ts (circular, for type)
├── frontmatterQueue.ts (no internal deps)
├── suggester.ts (no internal deps)
└── settings.ts
    ├── types.ts
    └── main.ts (circular)
```

**Dependency Analysis:**
- **Core modules:** types.ts (foundational), main.ts (orchestrator)
- **Entry points:** main.ts (plugin entry), settings.ts (UI entry)
- **Leaf modules:** types.ts, frontmatterQueue.ts, suggester.ts (no dependents outside main)
- **Circular dependencies:** main.ts ↔ settings.ts (acceptable for settings tabs in Obsidian)

**Import Categories:**
- **Type-only imports:** Primarily types.ts
- **Runtime imports:** All other modules
- **External imports:** Only Obsidian API

---

## Architectural Patterns

### Overall Architecture

The plugin follows a **service-oriented architecture** with clear separation of concerns:

1. **Entry Point Layer** (main.ts) - Orchestrates all functionality
2. **Service Layer** (logger.ts, frontmatterQueue.ts) - Specialized services
3. **UI Layer** (settings.ts, suggester.ts) - User interaction
4. **Domain Layer** (types.ts) - Core data models

The architecture follows Obsidian's Plugin API conventions while organizing code into cohesive modules.

### Separation of Concerns

- **UI Layer:**
  - `settings.ts` - Configuration UI (settings tab)
  - `suggester.ts` - Selection modals
  - Modal interactions in main.ts (thought capture)
  
- **Business Logic:**
  - `main.ts` - Spaced repetition algorithm, note management, command handlers
  - Context filtering, method selection, interval calculation
  
- **Data Layer:**
  - Frontmatter (Obsidian's metadata system) - Note metadata storage
  - Plugin settings (Obsidian's data.json) - Configuration persistence
  - Log file (JSONL) - Activity logs
  
- **Integration Layer:**
  - `main.ts` - Obsidian API integration (commands, file operations, metadata)
  - `frontmatterQueue.ts` - Obsidian fileManager API wrapper
  - `logger.ts` - Obsidian vault API wrapper

### Design Patterns Identified

1. **Plugin Pattern**
   - **Used In:** main.ts
   - **Purpose:** Integration with Obsidian's plugin system
   - **Implementation:** SpacedEverythingPlugin extends Plugin class

2. **Command Pattern**
   - **Used In:** main.ts
   - **Purpose:** User-triggered actions
   - **Implementation:** Commands registered in onload() with callbacks

3. **Queue Pattern**
   - **Used In:** frontmatterQueue.ts
   - **Purpose:** Batch and deduplicate frontmatter updates
   - **Implementation:** Map-based queue with atomic processing

4. **Service Pattern**
   - **Used In:** logger.ts, frontmatterQueue.ts
   - **Purpose:** Encapsulate specific functionality
   - **Implementation:** Classes with focused responsibilities, dependency injection

5. **Modal Pattern**
   - **Used In:** suggester.ts, settings.ts
   - **Purpose:** User input and confirmation
   - **Implementation:** Extends Obsidian's Modal and SuggestModal classes

6. **Strategy Pattern (implicit)**
   - **Used In:** SpacingMethod configuration
   - **Purpose:** Support multiple spacing algorithms
   - **Implementation:** Algorithm selection via configuration (currently only SuperMemo 2.0 implemented)

7. **Template Method Pattern**
   - **Used In:** Thought capture template processing
   - **Purpose:** Variable substitution in templates
   - **Implementation:** String replacement for {{unixtime}}, {{date}}, {{time}}, {{thought}}

8. **Observer Pattern (implicit)**
   - **Used In:** Metadata cache usage
   - **Purpose:** React to file changes
   - **Implementation:** Uses Obsidian's metadataCache which observes file changes

### Plugin Lifecycle

1. **Load:** 
   - Obsidian calls `onload()`
   - Plugin loads settings from data.json
   - Logger initialized with settings
   - FrontmatterQueue initialized
   - Settings tab registered
   - Commands registered

2. **Initialize:**
   - Commands become available in command palette
   - Settings tab appears in Obsidian settings
   - Plugin ready to respond to user actions

3. **Ready:**
   - User can execute commands
   - Settings can be modified
   - Notes can be reviewed
   - Thoughts can be captured

4. **Unload:**
   - Obsidian calls `onunload()`
   - Currently empty (no cleanup needed)
   - Pending frontmatter updates are lost (by design)

---

## Data Flow

### User Interactions

#### Review Flow
```
User: Execute "Log review outcome" command
  ↓
main.ts: logReviewOutcome()
  ↓
Check if note onboarded (isNoteOnboarded)
  ↓
If not onboarded:
  → onboardNoteToSpacedEverything()
  → Toggle contexts (suggester modal)
  → Select spacing method (suggester modal)
  → Queue frontmatter updates
  → Process queue
  → Log action (logger.ts)
  ↓
If onboarded:
  → Get active spacing method
  → Show review options (suggester modal)
  → If "Remove" selected:
    → removeNoteFromSpacedEverything()
    → Queue frontmatter deletion
  → If review option selected:
    → updateInterval() (SuperMemo 2.0 calculation)
    → Queue frontmatter updates (interval, ease, last-reviewed)
    → Log review (logger.ts)
  ↓
Process all queued updates (frontmatterQueue.ts)
  ↓
Notify user of result
```

#### Opening Next Review Item
```
User: Execute "Open next review item" command
  ↓
main.ts: openNextReviewItem()
  ↓
Get all markdown files from vault
  ↓
Filter by context (filterNotesByContext)
  → Check active contexts
  → Filter notes with matching contexts
  ↓
Filter by due date
  → Parse se-last-reviewed timestamp
  → Calculate due time (last-reviewed + interval)
  → Check if current time > due time
  ↓
Sort by due time (earliest first)
  ↓
Open first note (or show "No notes to review" notice)
```

#### Thought Capture Flow
```
User: Execute "Capture thought" command
  ↓
main.ts: captureThought()
  ↓
Show modal with textarea
  ↓
User enters thought and presses Enter
  ↓
Process thought content:
  → Replace {{unixtime}}, {{date}}, {{time}} variables
  ↓
Generate unique file path:
  → Process title template with variables
  → Check if file exists
  → Add counter if needed
  ↓
Create note file with template:
  → Replace {{thought}} in template
  → Create file in vault
  ↓
Open new note
  ↓
Onboard to Spaced Everything:
  → onboardNoteToSpacedEverything()
  → Queue context selection
  → Queue spacing method selection
  → Queue frontmatter (se-interval, se-last-reviewed, se-ease, se-method)
  ↓
Queue capture timestamp and alias (if applicable)
  ↓
Process all queued updates
  ↓
Note ready for review
```

### File Processing

#### Frontmatter Update Process
```
Command/Action needs to update frontmatter
  ↓
main.ts: queueFrontmatterUpdate(file, updates)
  ↓
frontmatterQueue.ts: add(file, updates)
  → Check if file already in queue
  → Merge updates with existing updates for file
  → Store in Map keyed by file path
  ↓
Continue executing command (queue more updates if needed)
  ↓
main.ts: processFrontmatterQueue()
  ↓
frontmatterQueue.ts: process()
  → Iterate through all queued files
  → For each file:
    → Call updateFrontmatter()
    → Use Obsidian fileManager.processFrontMatter()
    → Apply all updates (or delete if value is undefined)
  → Clear queue
  ↓
All frontmatter updated atomically
```

### Settings Management

```
Plugin loads
  ↓
main.ts: loadSettings()
  → Read data.json from vault
  → Merge with DEFAULT_SETTINGS
  → Store in this.settings
  ↓
Settings available to plugin
  ↓
User changes settings in UI
  ↓
settings.ts: onChange callback
  → Update plugin.settings object
  → Call plugin.saveSettings()
  ↓
main.ts: saveSettings()
  → Serialize settings to data.json
  → Save to vault
  ↓
Settings persisted
```

### Spaced Repetition Flow

```
Note reviewed (logReviewOutcome)
  ↓
Get review score from user (suggester)
  ↓
main.ts: updateInterval(file, frontmatter, reviewScore, ...)
  ↓
Retrieve previous values:
  → se-interval (or default from spacing method)
  → se-ease (or default from spacing method)
  ↓
SuperMemo 2.0 calculation:
  1. Calculate new ease factor:
     newEase = prevEase + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
     newEase = max(1.3, newEase)
  
  2. Calculate new interval:
     newInterval = max(1, prevInterval * newEase)
  
  3. Special rule:
     if (score < 3) newInterval = 1
  ↓
Queue frontmatter updates:
  → se-interval: newInterval
  → se-ease: newEaseFactor
  → se-last-reviewed: current timestamp
  ↓
Log review (if logging enabled)
  ↓
Process queue (apply updates)
  ↓
Note scheduled for next review
```

---

## Code Conventions

### File Organization
- One primary export per file (class or function)
- Related functionality grouped in single files
- Separate concerns into modules (types, UI, services, main logic)
- Types defined separately from implementation

### Naming Conventions
- **Classes:** PascalCase (e.g., `FrontmatterQueue`, `Logger`)
- **Functions/Methods:** camelCase (e.g., `logReviewOutcome`, `formatTimestamp`)
- **Variables:** camelCase (e.g., `nowFormatted`, `activeSpacingMethod`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `DEFAULT_SETTINGS`)
- **Interfaces:** PascalCase (e.g., `SpacedEverythingPluginSettings`)
- **Private methods:** camelCase prefixed with `private` keyword (e.g., `private generateLogData()`)
- **Frontmatter properties:** kebab-case with `se-` prefix (e.g., `se-interval`, `se-last-reviewed`)

### Import Conventions
- Obsidian imports grouped together (from 'obsidian')
- Internal imports after Obsidian imports
- Destructured imports for multiple items from same module
- Type imports use same syntax as value imports

### Error Handling
- User-facing errors shown via `Notice` class
- Internal errors logged to console
- Logger methods catch and log errors without throwing
- Graceful degradation (e.g., logging disabled if path empty)
- Validation with user feedback (e.g., "must be a number" notices)

### Type Usage
- Interfaces preferred over types for data structures
- Type exports use `export type { ... }` syntax
- Optional properties marked with `?`
- Type annotations on function parameters
- Return type annotations on functions (explicitly typed)
- `any` used sparingly (only for dynamic frontmatter objects)

### Async/Await Patterns
- Async methods consistently use `async`/`await`
- Promise wrappers for callback-based APIs (e.g., frontmatter updates)
- Error handling with try/catch where appropriate
- No mixing of Promise.then() and async/await

### Settings Patterns
- Default settings as constant object
- Settings merged with defaults on load
- Settings saved after each change
- Settings accessed via `this.plugin.settings`

---

## Key Insights

### Strengths

1. **Clear separation of concerns** - Each module has a focused responsibility
2. **Type safety** - Comprehensive TypeScript interfaces and type annotations
3. **Queue-based updates** - Prevents race conditions in frontmatter updates
4. **Configurable logging** - Privacy-conscious with granular control
5. **Reusable UI components** - Suggester pattern used throughout
6. **Template system** - Flexible thought capture with variable substitution
7. **Timezone awareness** - Handles both UTC and local timestamps
8. **Context system** - Flexible note categorization with active/inactive states
9. **Multiple spacing methods** - Extensible architecture (though only one implemented)
10. **Graceful error handling** - Errors don't crash the plugin

### Areas of Complexity

1. **Circular dependency between main.ts and settings.ts** - Acceptable for Obsidian plugins but worth noting
2. **SuperMemo 2.0 algorithm in main.ts** - Could be extracted to separate module for better testability
3. **Context filtering logic** - Multiple edge cases (no contexts, all inactive, empty note contexts)
4. **Timestamp parsing** - Complex logic to handle legacy timestamps without timezone info
5. **Method fallback logic** - Multiple fallback paths when `se-method` not set or invalid
6. **Settings UI rendering** - Large display() method with complex nested structures
7. **Template variable replacement** - Multiple replacement functions with similar logic
8. **Bulk onboarding** - Folder exclusion logic with parent traversal

### Potential Refactoring Opportunities

1. **Extract SuperMemo 2.0 algorithm** - Move to separate class/module with unit tests
2. **Create SpacingAlgorithm interface** - Formalize strategy pattern for future algorithms
3. **Consolidate template processing** - Single function for all variable replacements
4. **Simplify settings rendering** - Break down display() method into smaller components
5. **Add TypeScript strict mode** - Enable stricter type checking
6. **Create domain services** - NoteService, ReviewService to reduce main.ts size
7. **Add validation layer** - Centralize settings and input validation
8. **Improve error types** - Custom error classes instead of generic errors

---

##
