# Glossary

This glossary defines terms and concepts used in Spaced Everything. For more detailed information, refer to the [README](../README.md).

## Core Concepts

### Spaced Repetition
A learning technique that increases intervals of time between reviews of previously learned material. The spacing effect shows that learning is more effective when study sessions are spaced out over time rather than crammed together.

### Spaced Writing Practice (SWP)
An adaptation of spaced repetition for creative and knowledge work, inspired by Andy Matuschak's note-taking methodology. Instead of testing memorization, SWP surfaces notes at optimal times for productive engagement and development.

### SuperMemo 2.0
A spaced repetition algorithm developed by Piotr Woźniak in 1987. It adjusts review intervals based on recall quality, using two key metrics: interval length and ease factor. This is currently the only spacing algorithm supported by Spaced Everything.

## Algorithm Terms

### Interval
The number of days between reviews of a note. In regular spaced repetition applied to memorization, intervals grow with successful reviews and reset to minimum on failed reviews. In the context of SWP, intervals grow when developing ideas in a note are unfruitful while they reset when progress is fruitful, ensuring the note resurfaces again quickly. Stored in the `se-interval` frontmatter property.

### Ease Factor
A multiplier (typically 1.3 to 3.0) that determines how quickly intervals grow. In regular spaced repetition applied to memorization, higher ease factors indicate material that's easier to engage with, while lower factors indicate harder material. In the context of SWP, higher ease factor means reiewing the note is less fruitful, while smaller ease factors indicate each revisit of the note sparks new thinking. The algorithm adjusts ease based on review quality. Stored in the `se-ease` frontmatter property.

### Review Quality Score
A numeric rating (0-5 in SuperMemo 2.0) that indicates how productive a memorization review session was:
- **0-2**: Failed/unproductive → interval resets
- **3-5**: Successful/productive → interval grows

In SWP, this maps to review options like:
- "Fruitful" (low score): writing was productive when revisiting the note
- "Unfruitful" (high score): revisiting the note did not spark new thoughts

### Minimum Interval
The shortest possible interval between reviews, typically 1 day. Notes return to this interval after low score reviews (score < 3). Configurable in spacing method settings as "Default interval".

### Maximum Interval
An optional cap on how long intervals can grow, preventing notes from being forgotten due to excessively long gaps. While SuperMemo 2.0 allows unlimited growth, many implementations cap intervals at 365 days (1 year).

## Plugin Concepts

### Onboarding
The process of adding a note to the spaced repetition system by initializing its frontmatter properties (`se-interval`, `se-last-reviewed`, `se-ease`). Onboarding can be done individually per note or in bulk for the entire vault.

### Due Date
The calculated date when a note becomes eligible for review, determined by adding the interval to the last reviewed date (`se-last-reviewed + se-interval`). Notes with due dates in the past appear in the review queue, sorted with oldest due dates first. Notes with future due dates are excluded from reviews until that date arrives.

The due date is not stored as a frontmatter property—it's computed on-demand whenever the review queue is accessed. This ensures the queue always reflects the current state without requiring additional file updates.

### Context
A category or tag for organizing notes into separate review queues. Examples include "Work", "Personal", "Learning", or "Reference". Contexts allow focused review sessions and can have different spacing methods.

- **Active Context**: A context that's currently enabled for reviews. Only notes with active contexts are included in the review queue.
- **Inactive Context**: A context that's temporarily disabled. Notes with only inactive contexts are excluded from reviews.
- **Context Filtering**: The process of determining which notes to include in reviews based on active contexts.

**Usage Examples:**

A typical workflow might organize notes by life domain:
- **Work**: Project documentation, meeting notes, work-related research
- **Personal**: Journal entries, personal goals, hobby notes
- **Learning**: Study notes, courses, technical research

With contexts configured, you can focus reviews based on your current situation:
- During work hours, activate only the "Work" context to review professional notes
- In the evening, switch to the "Personal" context for personal development
- On weekends, activate "Learning" to engage with study material

Notes can belong to multiple contexts. For example, a note about "presentation skills" might have both "Work" and "Personal" contexts, appearing in either review queue depending on which contexts are active.

### Spacing Method
A configuration defining the algorithm and parameters used to calculate review intervals. Each method includes settings for:
- Algorithm (currently only SuperMemo 2.0)
- Name
- Default interval for new notes
- Default ease factor
- Review options with scores
- Optional maximum interval

Multiple spacing methods can be defined and mapped to different contexts.

### Review Options
Customizable choices presented to users during review, each mapped to a numeric score. Default options are:
- **Fruitful**: Good progress made (low score, typically 0-2)
- **Unfruitful**: Limited progress (high score, typically 4-5)  
- **Ignore**: Moderate progress (mid score, typically 3)

### Review Queue
The ordered list of notes due for review, calculated by:
1. Finding notes where (last reviewed + interval) ≤ current date
2. Filtering by active contexts
3. Sorting by due date (oldest first)

## Frontmatter Properties

### se-interval
Frontmatter property storing the review interval in days. Updated after each review based on the algorithm and review quality score.

### se-last-reviewed
Frontmatter property storing the ISO 8601 timestamp of the last review. Used with `se-interval` to calculate when the note is next due.

### se-ease
Frontmatter property storing the ease factor (typically 1.3 to 3.0). Adjusted after each review to personalize the spacing for each note.

### se-contexts
Optional frontmatter property storing the context(s) a note belongs to. Can be a single string or array of strings for multiple contexts.

### se-spacing-method
Optional frontmatter property overriding which spacing method to use for a specific note. References a spacing method name from settings.

## Features

### Capture Thought
A quick note creation workflow for capturing fleeting ideas. Creates a new note from templates, automatically onboards it to the review system, and optionally opens it for immediate editing.

### Template Variables
Dynamic placeholders in captured thought templates:
- `{{date}}`: Current date (YYYY-MM-DD)
- `{{time}}`: Current time (HH:MM:SS)
- `{{unixtime}}`: Unix timestamp (milliseconds)
- `{{thought}}`: The captured thought text

### Bulk Onboarding
A beta feature that onboards all notes in a vault at once, with folder exclusion support. Useful for bootstrapping an existing vault but requires careful use to avoid onboarding templates, scripts, or other non-content files.

### Logging
Optional privacy-conscious activity tracking that records review actions to a JSONL file. Customizable to control exactly what data is captured (note titles, frontmatter properties, actions).

## Technical Terms

### JSONL (JSON Lines)
A file format where each line is a valid JSON object. Used for logging review activity because it's easy to append new entries and process incrementally.

### ISO 8601
An international standard for date and time formatting. Used for timestamps in `se-last-reviewed` to ensure consistent parsing across timezones. Format: `YYYY-MM-DDTHH:MM:SS` with optional timezone.

### UTC (Coordinated Universal Time)
A timezone-independent time standard. Using UTC for timestamps ensures portability across different timezones and daylight saving changes.

### Frontmatter
YAML metadata at the top of markdown files enclosed in `---` delimiters. Obsidian and Spaced Everything use frontmatter to store structured data about notes.

### MetadataCache
Obsidian's internal cache of parsed file metadata (frontmatter, links, headings). Provides fast access to note properties without reading files from disk.

## Algorithm Constants

### SuperMemo 2.0 Constants
Empirically-derived values used in the ease factor adjustment formula:
- **0.1**: Base ease adjustment per review
- **0.08**: Primary difficulty scaling factor
- **0.02**: Secondary difficulty scaling factor  
- **1.3**: Minimum ease factor (algorithm constraint)

These constants were determined through extensive experimentation by Piotr Woźniak and represent optimal values for human learning patterns.

## User Interface Terms

### Command Palette
Obsidian's command interface (Ctrl/Cmd + P) where all plugin commands are registered and accessible.

### Settings Tab
The plugin's configuration interface within Obsidian's settings window. Accessed through Settings → Community plugins → Spaced Everything.

### Modal
A popup dialog in Obsidian's UI. Used by Spaced Everything for:
- Selecting contexts when onboarding
- Choosing review options
- Entering captured thoughts
- Confirming bulk operations

### Suggester
A reusable UI component (based on Obsidian's SuggestModal) that provides fuzzy-searchable selection lists. Used for context selection and review option selection.

## Related Concepts

### Andy Matuschak's Evergreen Notes
A note-taking methodology emphasizing:
- Notes should be densely linked
- Write notes for yourself by default
- Make notes atomic (one concept per note)
- Periodically review and develop notes over time

Spaced Everything implements the periodic review aspect using spaced repetition.

### Writing Inbox
A concept from Andy Matuschak's methodology where fleeting thoughts are captured quickly and later processed into more developed notes. The "Capture thought" feature attempts to implement this pattern.

### Piotr Woźniak
Creator of SuperMemo and pioneer of spaced repetition research. His work on memory optimization led to the development of the SuperMemo algorithms, including SM-2 (SuperMemo 2.0).

## Edge Cases and Special Behaviors

### Notes Without Contexts
Notes without a `se-contexts` property are included in reviews for backward compatibility with vaults that predate the contexts feature. This ensures users don't lose access to onboarded notes after upgrading.

### All Contexts Inactive
When all contexts are toggled inactive, the plugin includes all notes in reviews. This prevents accidentally emptying the review queue and ensures users can always review notes.

### Ease Factor Floor
The SuperMemo 2.0 algorithm enforces a minimum ease factor of 1.3. This prevents intervals from shrinking too aggressively on difficult material, ensuring notes don't get stuck in very short review cycles.

### Timestamp Ambiguity
When timestamps lack explicit timezone information (e.g., manually edited via Obsidian's properties panel), the plugin uses the configured `timestampTimeZone` setting to interpret them.

## Acronyms

- **SWP**: Spaced Writing Practice
- **SM-2**: SuperMemo 2.0 algorithm
- **UTC**: Coordinated Universal Time
- **ISO**: International Organization for Standardization
- **JSONL**: JSON Lines
- **YAML**: YAML Ain't Markup Language (used in frontmatter)
- **UI**: User Interface
- **API**: Application Programming Interface

---

*This glossary is a living document. Terms may be added or refined as the plugin evolves. For questions or suggestions, please open an issue on [GitHub](https://github.com/zachmueller/spaced-everything/issues).*
