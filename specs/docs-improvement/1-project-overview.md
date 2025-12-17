# Project Overview

**Generated:** 2025-12-18  
**Version:** 1.3.3 (from manifest.json)  
**Purpose:** High-level understanding of Spaced Everything architecture and concepts

## Project Identity

### Name and Purpose

**Spaced Everything** is an Obsidian plugin that applies spaced repetition algorithms to note-taking within your vault. The plugin enables a "Spaced Writing Practice" (SWP) methodology inspired by Andy Matuschak's note-taking approach, using the SuperMemo-2.0 algorithm to intelligently schedule when notes should be reviewed. Rather than traditional flashcard-based spaced repetition, this plugin treats entire notes as review items, encouraging iterative refinement and engagement with your knowledge base over time.

### Target Users

The plugin targets knowledge workers and note-takers who:
- Use Obsidian for personal knowledge management
- Want to systematically revisit and develop their notes over time
- Are familiar with spaced repetition concepts and want to apply them beyond traditional memorization
- Appreciate Andy Matuschak's evergreen notes and incremental writing philosophies
- Maintain both personal and professional note collections that need separate review workflows (contexts)

This is a plugin for users comfortable with Obsidian's frontmatter system and YAML metadata, as the plugin heavily relies on frontmatter properties for tracking review state.

### Value Proposition

**Core Benefits:**
1. **Systematic Note Evolution**: Ensures notes are revisited at optimal intervals, preventing them from becoming stale or forgotten
2. **Context-Aware Review**: Separate work notes from personal notes, or any other categorization, through flexible context management
3. **Low-Friction Capture**: Quick thought capture with customizable templates ensures fleeting ideas are preserved and scheduled for development
4. **Algorithmic Scheduling**: Leverages proven spaced repetition algorithms to optimize review timing based on your assessment of each review session
5. **Transparent Workflow**: All metadata stored in frontmatter means no vendor lock-in; your review data lives with your notes

**Unique Features:**
- Multiple contexts with individual activation states
- Optional logging of all review actions to JSONL format for analysis
- Configurable review options (Fruitful/Ignore/Unfruitful) mapped to algorithm quality scores
- Support for multiple spacing methods (extensibility built in for future algorithms)
- Timezone-aware timestamps (UTC or local time)

## Core Concepts

### Terminology

**Spaced Writing Practice (SWP)**: The core methodology—a systematic approach to iteratively developing notes by reviewing them at algorithmically-determined intervals. Unlike traditional spaced repetition for memorization, SWP focuses on note refinement and idea development.

**Review Outcome**: When reviewing a note, users classify the session as:
- **Fruitful**: Made good progress; note should return to queue sooner
- **Ignore**: Middle ground; standard spacing progression
- **Unfruitful**: Limited progress; note pushed further out in queue

These are customizable labels mapped to SuperMemo quality scores (1-5).

**Contexts**: Named categories (e.g., "work", "personal", "research") assigned to notes to control which notes appear in the review queue. Contexts can be toggled active/inactive, allowing users to focus on specific subsets of their vault during a review session.

**Onboarding**: The process of adding a note to the spaced writing practice system. Only explicitly onboarded notes participate in the review queue. This prevents the entire vault from being included inadvertently.

**Review Queue**: The ordered list of notes due for review, calculated by checking each note's `se-last-reviewed` timestamp plus `se-interval` against the current time. Notes are presented in order of oldest due date first.

**Captured Thought**: A quick note created via the "Capture thought" command, automatically onboarded to SWP with customizable title and content templates.

### Domain Concepts

**Spaced Repetition Applied to Writing**: Traditional spaced repetition focuses on memorization through flashcards. This plugin adapts the concept for note development:
- Instead of "Did I remember?", ask "Did I make progress?"
- Instead of fixed Q&A pairs, work with evolving, interconnected notes
- Instead of achieving mastery, aim for continuous refinement and insight generation

**Andy Matuschak's Influence**: The plugin draws from Matuschak's public notes on:
- [Spaced repetition may be a helpful tool to incrementally develop inklings](https://notes.andymatuschak.org/z7iCjRziX6V6unNWL81yc2dJicpRw2Cpp9MfQ)
- Writing inbox for capturing fleeting thoughts
- Evergreen notes that improve over time
- Using spaced repetition to maintain engagement with a growing note collection

**SuperMemo 2.0 Algorithm**: Currently the only implemented spacing algorithm. Key mechanics:
- Quality score (1-5) affects the "ease factor" for a note
- Ease factor modulates how quickly intervals grow
- Poor reviews (score < 3) reset interval to 1 day
- Formula: `newInterval = prevInterval * easeFactor`
- Minimum ease factor capped at 1.3 to prevent infinite stagnation

### Technical Concepts

**Frontmatter-Driven State**: All review state is stored in YAML frontmatter at the top of each note:
```yaml
se-interval: 5.2      # Days until next review
se-ease: 2.3          # Ease factor for interval calculation
se-last-reviewed: 2025-12-18T07:30:00Z  # ISO timestamp
se-contexts: [work, research]  # Array of context names
se-method: "SuperMemo 2.0 (Simplified)"  # Active spacing method
se-capture-time: 1734497400  # Unix timestamp (for captured thoughts)
```

This approach means:
- Review data is human-readable and editable
- No separate database or proprietary storage
- Notes remain portable outside the plugin
- Git-friendly (text-based changes)

**Frontmatter Queue**: To avoid race conditions and file system conflicts, the plugin batches frontmatter updates into a queue that processes sequentially. This ensures multiple simultaneous updates to a note's metadata don't corrupt the file.

**Context Filtering**: When opening the next review item, the plugin:
1. Checks which contexts are active in settings
2. Filters notes to only those matching active contexts (or no contexts at all)
3. Among filtered notes, finds those with due dates in the past
4. Returns the oldest due note

If no contexts are defined, all notes participate. If all contexts are inactive, no notes are eligible.

## Architecture Overview

### Plugin Structure

```
src/
├── main.ts              # Core plugin logic, commands, review workflow
├── types.ts             # TypeScript interfaces (Context, ReviewOption, SpacingMethod)
├── settings.ts          # Settings UI and configuration management
├── logger.ts            # JSONL logging of review actions
├── frontmatterQueue.ts  # Batched frontmatter update queue
└── suggester.ts         # UI utility for dropdown selections
```

The plugin follows a straightforward architecture with clear separation of concerns:
- **main.ts**: Command handlers, review logic, algorithm implementation
- **settings.ts**: All user configuration and settings panel rendering
- **logger.ts**: Optional audit trail of review actions
- **frontmatterQueue.ts**: Prevents concurrent frontmatter modification conflicts
- **suggester.ts**: Reusable UI pattern for multi-choice prompts

### Main Components

**SpacedEverythingPlugin** (main.ts):
- Plugin lifecycle (onload/onunload)
- Command registration (5 commands total)
- Review workflow orchestration
- Interval calculation (SuperMemo 2.0 implementation)
- Note onboarding/removal
- Context filtering logic
- Timestamp handling (UTC vs local timezone)

**Settings System** (settings.ts):
- Manages contexts, spacing methods, review options
- Captures logging preferences
- Controls captured thought templates
- Provides UI for all configuration

**Logger** (logger.ts):
- Writes review actions to JSONL file
- Captures action type, timestamp, note metadata, review scores
- Optional frontmatter property logging for analysis

**FrontmatterQueue** (frontmatterQueue.ts):
- Queues updates to note frontmatter
- Processes queue sequentially to avoid conflicts
- Integrates with Obsidian's `processFrontMatter` API

**Suggester** (suggester.ts):
- Utility for showing dropdown selection modals
- Used for review options, context selection, spacing method selection

### Data Flow

**Review Workflow:**
1. User invokes "Log review outcome" command
2. Plugin checks if note is onboarded (has `se-interval` property)
3. If not onboarded: prompt for contexts and spacing method, initialize frontmatter
4. If onboarded: show review options (Fruitful/Ignore/Unfruitful/Remove)
5. User selects outcome
6. Plugin calculates new interval using SuperMemo 2.0 formula
7. Queue frontmatter updates (interval, ease, last-reviewed timestamp)
8. Process queue to write changes to file
9. Optional: log action to JSONL file

**Opening Next Review Item:**
1. User invokes "Open next review item" command
2. Plugin gets all markdown files in vault
3. Filter by active contexts
4. Filter to only onboarded notes (have `se-interval`)
5. Calculate due date for each: `last-reviewed + (interval * 24 hours)`
6. Filter to notes with due date <= now
7. Sort by oldest due date first
8. Open the first note in queue (or show "No notes to review" notice)

**Capturing Thought:**
1. User invokes "Capture thought" command
2. Modal appears for text entry
3. User types thought and presses Enter
4. Plugin processes template variables ({{unixtime}}, {{date}}, {{time}})
5. Generate unique filename from title template
6. Create note file with thought inserted into template
7. Open note in editor (new tab or current)
8. Onboard note to SWP with selected contexts
9. Add capture timestamp to frontmatter

### Integration with Obsidian

**Obsidian APIs Used:**
- **Plugin API**: Base class for plugin lifecycle
- **Editor/MarkdownView**: Access to active editor for commands
- **TFile/Vault**: File system operations (create, modify, read)
- **MetadataCache**: Reading frontmatter without file I/O
- **FileManager.processFrontMatter**: Safe frontmatter modification
- **Workspace**: Opening files, managing active leaves/tabs
- **Modal**: Custom UI for thought capture
- **Notice**: User notifications

**Command Integration:**
The plugin registers 5 commands in Obsidian's command palette:
1. Log review outcome (Ctrl/Cmd+P → search "Log review outcome")
2. Open next review item
3. Toggle note contexts
4. Capture thought
5. Update spacing method

**Settings Integration:**
Adds a settings tab in Obsidian's settings panel under "Community plugins" → "Spaced everything"

## User Workflows

### Primary Use Cases

1. **Daily Review Sessions**: Open Obsidian, invoke "Open next review item", review note, log outcome, repeat until queue is clear or session time expires

2. **Context-Specific Review**: Toggle contexts to "work" mode during work hours, "personal" mode in evenings, ensuring appropriate notes appear in each context

3. **Capturing Fleeting Thoughts**: Quick keyboard shortcut to invoke "Capture thought", type idea, Enter, continue working—thought is automatically scheduled for review

4. **Note Onboarding**: Gradually add notes to SWP as they mature, rather than overwhelming the queue with underdeveloped notes

5. **Spacing Method Experimentation**: (Future) Switch notes between different spacing algorithms to find optimal review cadence for different note types

### User Journey

**Initial Setup:**
1. Install plugin from Obsidian Community Plugins
2. Configure settings:
   - Set up contexts (optional but recommended)
   - Customize review options if desired (default: Fruitful/Ignore/Unfruitful)
   - Configure captured thought templates
   - Enable logging if desired for review analytics
3. Set up hotkeys for frequently-used commands (Settings → Hotkeys)

**Daily Use:**
1. **Morning**: Open Obsidian, activate "work" context if using contexts
2. **Review Session**: 
   - Invoke "Open next review item"
   - Read note, make edits, add connections
   - Invoke "Log review outcome"
   - Select outcome based on progress (Fruitful/Ignore/Unfruitful)
   - Repeat until no more notes due or session time expires
3. **Throughout Day**: When inspiration strikes, invoke "Capture thought", jot down idea
4. **Evening**: Switch to "personal" context, do another review session

**Note Development:**
1. Create new note through normal Obsidian workflow
2. Develop note to point where it's ready for iterative refinement
3. While viewing note, invoke "Log review outcome"
4. Select contexts and spacing method for the note
5. Note is now onboarded and will appear in review queue

**Maintenance:**
- Periodically review captured thoughts to see which have developed into substantial notes
- Adjust contexts as workflows evolve
- Remove notes from SWP if they're no longer relevant ("Remove" option during review)
- Export log file for analysis of review patterns (if logging enabled)

### Configuration Options

**Contexts:**
- Create named contexts (unlimited)
- Toggle contexts active/inactive
- Assign default spacing method per context

**Spacing Methods:**
- Currently: SuperMemo 2.0 (Simplified) only
- Future: Custom algorithms via scripts
- Per-method configuration: review options, default interval, default ease factor

**Review Options:**
- Customize labels (default: Fruitful/Ignore/Unfruitful)
- Map each option to quality score (1-5) for algorithm
- Add/remove options as needed

**Captured Thoughts:**
- Title template with variables ({{unixtime}}, {{date}}, {{time}})
- Directory for new notes
- Content template with {{thought}} variable
- Option to add short thoughts as aliases
- Open in new tab vs. current tab

**Logging:**
- Enable/disable logging
- Log file path
- Which actions to log (onboard, remove, review)
- Which frontmatter properties to include in log entries
- Note title inclusion

**Timestamps:**
- UTC or local timezone for all timestamps

**Onboarding:**
- Excluded folders (notes in these folders won't be suggested for onboarding)

## Technology Stack

### Core Technologies

**TypeScript 4.7.4**
- Strong typing for plugin architecture
- Interfaces for settings, contexts, review options
- Async/await throughout for file operations
- Modern ES features (template literals, destructuring, optional chaining)

**Obsidian API (latest)**
- Plugin API for lifecycle management
- Vault API for file system operations
- MetadataCache for efficient frontmatter reading
- FileManager for safe frontmatter modification
- Workspace API for UI integration
- Modal and Notice for user interaction

**Build Tools**
- **esbuild 0.17.3**: Fast JavaScript bundler
- **esbuild.config.mjs**: Custom build configuration
- Development mode with watch: `npm run dev`
- Production build with type checking: `npm run build`

### Key Dependencies

**Development Dependencies:**
- **obsidian**: Type definitions and API access for Obsidian plugin development
- **typescript**: Language compiler (v4.7.4)
- **tslib**: TypeScript runtime library (v2.4.0)
- **@types/node**: Node.js type definitions (v16.11.6)
- **@typescript-eslint/eslint-plugin & parser**: Code quality linting (v5.29.0)
- **builtin-modules**: For excluding Node.js built-ins from bundle (v3.3.0)

**Runtime Dependencies:**
None—plugin bundles all code and relies on Obsidian's provided APIs.

### Development Environment

**Requirements:**
- Node.js (inferred v16+ from @types/node version)
- npm (package manager)

**npm Scripts:**
- `npm run dev`: Development build with watch mode (rebuilds on file changes)
- `npm run build`: Production build with TypeScript type checking
- `npm run version`: Bump version numbers across manifest.json and versions.json

**Development Workflow:**
1. Clone repository
2. `npm install` to install dependencies
3. `npm run dev` to start watch mode
4. Symlink or copy output to Obsidian vault's plugins folder
5. Enable plugin in Obsidian
6. Reload plugin after code changes (Ctrl/Cmd+R in dev mode)

**Code Style:**
- ESLint configured with TypeScript-specific rules
- .editorconfig for consistent formatting across editors
- .npmrc for npm configuration

## Integration Points

### Obsidian API Usage

**File System Integration:**
- `app.vault.getMarkdownFiles()`: Retrieve all notes for queue processing
- `app.vault.create()`: Create new note files (captured thoughts)
- `app.vault.adapter.exists()`: Check file existence for unique name generation
- `app.fileManager.processFrontMatter()`: Safe YAML frontmatter modification

**Metadata System:**
- `app.metadataCache.getFileCache()`: Read cached frontmatter without file I/O
- Frontmatter properties: `se-interval`, `se-ease`, `se-last-reviewed`, `se-contexts`, `se-method`, `se-capture-time`

**UI Components:**
- `Modal`: Custom modal for captured thought text entry
- `Notice`: Toast notifications for user feedback
- Custom suggester function: Dropdown selection for review options, contexts, spacing methods

**Workspace Management:**
- `app.workspace.getActiveFile()`: Get current note for review commands
- `app.workspace.activeLeaf.openFile()`: Open note in current tab
- `app.workspace.openLinkText()`: Open note in new tab

**Command System:**
- `addCommand()`: Register commands in command palette
- `editorCallback`: Commands that operate on active editor
- `callback`: Commands that work globally

**Settings System:**
- `addSettingTab()`: Register settings panel
- `loadData()` / `saveData()`: Persist settings to Obsidian's data.json

### File System Interactions

**Reading:**
- Frontmatter read through MetadataCache (cached, efficient)
- No direct file content reading—relies on Obsidian's caching

**Writing:**
- Frontmatter updates via `processFrontMatter()` API (Obsidian handles YAML parsing/serialization)
- New file creation via `vault.create()` with full content string
- All writes queued through FrontmatterQueue to prevent race conditions

**File Organization:**
- Plugin respects user's existing folder structure
- Captured thoughts can be directed to specific folder
- No automatic file moves or reorganization
- Optional folder exclusion for onboarding

### UI Components

**Settings Pane:**
- Tabbed interface for organizing settings
- Collapsible sections for contexts, spacing methods, logging, capture, onboarding
- Add/remove controls for contexts and spacing methods
- Text inputs, toggles, dropdowns, and text areas

**Modals:**
- Captured thought modal: Multi-line text entry with keyboard shortcuts (Enter to submit, Shift+Enter for newlines)

**Suggesters (Dropdowns):**
- Context selection (multi-toggle with ☑/☐ indicators)
- Review outcome selection (Fruitful/Ignore/Unfruitful/Remove)
- Spacing method selection

**Notices (Toasts):**
- Confirmation of actions (onboarded, removed, interval updated)
- Error messages (no active file, no contexts defined, etc.)
- Queue completion status

### Data Storage

**Plugin Settings (data.json):**
Stored in Obsidian vault's `.obsidian/plugins/spaced-everything/` directory:
```json
{
  "logFilePath": "logs/swp.jsonl",
  "contexts": [{name: "work", isActive: true}, ...],
  "spacingMethods": [{name: "SuperMemo 2.0", ...}],
  "reviewOptions": [...],
  "capturedThoughtTitleTemplate": "Inbox {{unixtime}}",
  ...
}
```

**Note Metadata (frontmatter):**
Each onboarded note contains:
```yaml
---
se-interval: 3.5
se-ease: 2.4
se-last-reviewed: 2025-12-18T07:30:00Z
se-contexts: [work, research]
se-method: "SuperMemo 2.0 (Simplified)"
se-capture-time: 1734497400
---
```

**Review Log (optional JSONL file):**
If logging enabled, each review action appends a JSON line:
```json
{"timestamp":"2025-12-18T07:30:00Z","action":"review","file":"my-note.md","score":1,"newInterval":5.2,...}
```

## Open Questions

1. **Glossary Completion**: The `docs/Glossary.md` file is marked TODO with a reference to external notes. What terminology needs formalization for public documentation?

2. **Custom Spacing Algorithms**: The codebase has infrastructure for multiple spacing methods, but currently only SuperMemo 2.0 is implemented. What's the timeline and design for custom algorithm scripts (mentioned in README and Issue #24)?

3. **Onboarding Experience**: How do users typically discover and start using the plugin? Is there a need for an onboarding wizard or sample vault (mentioned in Issue #22)?

4. **Review Session Wrapper**: Issue #26 mentions a "spaced writing session wrapper"—what additional functionality is envisioned beyond the current "open next item" command?

5. **Cloze Deletions**: Issue #18 mentions cloze deletions. How would this work with full notes vs. flashcard-style atomic prompts?

6. **Context-Spacing Method Relationship**: Contexts can have a default spacing method, but the implementation shows fallback logic when methods don't match. Is this relationship intended to be strict or flexible?

7. **Frontmatter Queue Timing**: When exactly does the queue process? Is there a risk of user edits conflicting with queued updates?

8. **Mobile Support**: `manifest.json` indicates `isDesktopOnly: false`, but has the plugin been tested on mobile? Are there mobile-specific UX considerations?

9. **Performance at Scale**: How does the plugin perform with thousands of onboarded notes? Is the linear scan through all files for each "open next" operation acceptable?

10. **Migration Path**: If a user changes timezone settings mid-usage, how are existing timestamps interpreted? Is there a migration strategy?

11. **Logging Analysis**: The JSONL log file is mentioned for analysis, but are there recommended tools or workflows for actually analyzing the data?

12. **Review Quality Score Semantics**: The mapping of review options to quality scores (1-5) is user-configurable but not well-documented. What guidance exists for choosing appropriate scores?

## Next Steps

The following aspects need deeper exploration in subsequent workflows:

1. **Detailed Code Structure** (Codebase Map workflow):
   - Line-by-line understanding of spacing algorithm implementation
   - Settings panel architecture and validation logic
   - FrontmatterQueue race condition handling
   - Logger format and data schema

2. **Current Documentation State** (Documentation Audit workflow):
   - Assess README completeness and clarity
   - Identify missing usage examples
   - Evaluate glossary gaps
   - Check inline code comments

3. **Specific Implementation Patterns**:
   - Error handling strategies
   - Testing approach (if any)
   - Obsidian API usage best practices
   - TypeScript patterns (interfaces, type guards, async patterns)

4. **User-Facing Documentation Needs**:
   - Getting started guide
   - Concept explanations (SWP, spacing algorithms)
   - Troubleshooting common issues
   - Advanced configuration examples

5. **Developer Documentation**:
   - Architecture decision records
   - Contributing guidelines
   - Adding custom spacing algorithms
   - Plugin development workflow
