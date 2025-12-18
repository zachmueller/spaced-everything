# Spaced Everything (Obsidian plugin)

_[Obsidian](https://obsidian.md/) plugin to apply spaced repetition algorithms to everything in your vault._

Borrowing from Andy Matuschak's [notes](https://notes.andymatuschak.org/About_these_notes?stackedNotes=zVFGpprS64TzmKGNzGxq9FiCDnAnCPwRU5T&stackedNotes=z5aJUJcSbxuQxzHr2YvaY4cX5TuvLQT7r27Dz&stackedNotes=z8aZybuJJopS5fL7TnPou2JcmCsBUJeqirbBh&stackedNotes=zJ5Yzvba2729XKXivBBZ91J&stackedNotes=zB92WZZ5baBHKZPPbWMbYEv&stackedNotes=zHwr5v9VJGX3MzHyzz4V8wt&stackedNotes=zDXBGEWk7msyonQ2Ngnrf8h&stackedNotes=zSK4LyrCbG9zDrdCWmcovUW&stackedNotes=z4KxfCZPkVEf2R8nayLJZBG) outlining such a practice, this plugin applies the main concepts of spaced repetition to writing. That is, using the SuperMemo 2.0 algorithm to decide what note to review next when engaging in a Spaced Writing Practice (SWP). The plugin allows tagging each note with multiple contexts (e.g., work vs personal) to only pull up notes appropriate for the moment.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Features](#features)
- [Configuration](#configuration)
- [Understanding SuperMemo 2.0](#understanding-supermemo-20)
- [Frontmatter Properties](#frontmatter-properties)
- [Template Variables](#template-variables)
- [Advanced Usage](#advanced-usage)
- [Future Development](#future-development)

## Installation

### From Obsidian Community Plugins

1. Open Obsidian Settings
2. Navigate to **Community plugins** and disable **Safe mode** (if not already disabled)
3. Click **Browse** and search for "Spaced Everything"
4. Click **Install**
5. Once installed, enable the plugin by toggling it on in the **Community plugins** list

### Manual Installation

1. Download the latest release from the [GitHub releases page](https://github.com/zachmueller/spaced-everything/releases)
2. Extract the files into your vault's plugins folder: `<vault>/.obsidian/plugins/spaced-everything/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community plugins

## Getting Started

### Quick Start Guide

1. **Open a note you want to review** - Start with any existing note in your vault

2. **Onboard the note** - Run the command `Spaced Everything: Log review outcome` (default hotkey: none)
   - If the note isn't yet onboarded, you'll be prompted to add it to the system
   - Choose a context (or skip if you haven't configured contexts)
   - Select a spacing method (or use default)

3. **Review and rate your progress** - After working on the note, rate how the review went:
   - **Fruitful**: Made good progress → note returns soon
   - **Unfruitful**: Limited progress → note pushed further out
   - **Ignore**: Middle ground → moderate spacing adjustment

4. **Continue your practice** - Run `Spaced Everything: Open next item for review` to pull up the next note in your queue

### Example Workflow

```
Day 1: Onboard "Project Ideas" note → Rate as "Fruitful"
       ↓ (1 day later)
Day 2: Review "Project Ideas" → Made progress → Rate as "Fruitful"  
       ↓ (1 day later)
Day 3: Review "Project Ideas" → Struggling to add more → Rate as "Ignore"
       ↓ (2-3 days later)
Day 6: Review "Project Ideas" → No progress → Rate as "Unfruitful"
        ↓ (5-7 days later)
Day 13: Review "Project Ideas" → Fresh perspective → Rate as "Fruitful"
```

The SuperMemo 2.0 algorithm automatically adjusts intervals based on your feedback, ensuring notes return at optimal times for productive engagement.

### Tips for Effective Practice

- **Start small**: Onboard 5-10 notes initially to establish the habit
- **Review regularly**: Daily practice works best for building momentum
- **Be honest with ratings**: Accurate feedback helps the algorithm optimize your schedule
- **Use contexts**: Separate work and personal notes for focused review sessions
- **Capture fleeting thoughts**: Use the "Capture thought" command to quickly onboard new ideas

## Features

### Review a Note

Taking from Andy's proposed idea, when reviewing a note you can select among three options for how the review went: Fruitful, Unfruitful, or Ignore. Fruitful means you made good progress on the note; this guides the spacing algorithm to include the note again soon in your queue. Unfruitful means you tried to engage with the note but progress was limited; this pushes that note out further in your queue. Ignore is an in-between option.

You may customize these options for this review process. You may add or delete options and change their numeric value. Currently, the only spacing algorithm implemented is the SuperMemo 2.0 algorithm. The numeric value provided in the settings alongside each review option maps to the "review quality score" from that algorithm.

**Command**: `Spaced Everything: Log review outcome`

### Pull Up Next Note in Review Queue

At any time, you may run the "Open next review item" command to pull up the next note in your review queue. This is calculated based on looking across the SWP frontmatter properties of notes in your vault. From there, it adds the interval value (in days) to the last review timestamp to derive the due date for each note. Then any notes with a due date in the future are filtered out. Among remaining notes, it sorts it by the earliest/oldest due date timestamp first and pulls notes in that order.

**Command**: `Spaced Everything: Open next item for review`

### Capture Thoughts

Inspired by Andy Matuschak's [writing inbox concept](https://notes.andymatuschak.org/zUP4GuzPF33dWkZPiu9N6V5), the "Capture thought" command allows for a rapid way to write down any sudden thought and have it immediately onboarded to the spaced writing queue.

The command prompts you to enter your thought, then creates a new note using your configured templates. The note is automatically onboarded to the review system, ensuring it returns for further development.

**Command**: `Spaced Everything: Capture thought`

### Toggle Note Contexts

By default, all notes are treated as one large queue of notes to review. However, you may optionally add any number of separate contexts to filter down which subset of notes to include when pulling up the next note in the review queue. When onboarding notes, it will prompt you to select which SWP context to add the note into. You may also run the "Toggle note contexts" command on any note to add/remove the note from any context.

You can create and remove SWP contexts from within the settings. You may also toggle which contexts are "active" (i.e., only notes matching an active context are considered when going through the review queue).

**Command**: `Spaced Everything: Toggle note contexts`

### Onboard Individual Notes

Only notes you actively choose to review to onboard are considered for the spaced writing practice review queue. When running the "Log review outcome" command on a note not yet onboarded, it will onboard the note. When conducting the review (using that same command), you may remove any individual note at any time.

### Logging

The actions you take in this spaced writing practice can optionally be logged to a local file. This data is stored in JSONL format. Some customization is possible in the settings, including providing a list of frontmatter properties that you are interested in capturing for whichever note the action was taken on.

Log files are privacy-conscious by default - you control exactly what data is captured.

## Configuration

Access plugin settings through: **Settings → Community plugins → Spaced Everything**

### Spacing Methods

Configure the algorithms and parameters that control review intervals.

**Name**: Give your spacing method a descriptive name (e.g., "Daily Learning", "Weekly Reference")

**Default interval**: Starting interval in days for newly onboarded notes (default: 1)

**Spacing algorithm**: Currently only SuperMemo 2.0 is supported
- Future releases will support custom algorithms

**Default ease factor**: Controls how quickly intervals grow (default: 2.5)
- Higher values = faster growth
- Lower values = slower growth
- Minimum: 1.3 (algorithm constraint)

**Review options**: Customize the choices presented during review
- **Name**: Label shown to user (e.g., "Fruitful", "Struggled", "No progress")
- **Score**: Numeric value from 0-5 mapping to SuperMemo 2.0 quality scores
  - 0-2: Interval resets to minimum
  - 3-5: Interval grows by ease factor

### Contexts

Organize notes into separate review queues for focused practice sessions.

**Creating contexts**:
1. Click the **+** button in the Contexts section
2. Name your context (e.g., "Work", "Personal", "Learning")
3. Toggle the context active/inactive to control which notes are reviewed

**Context behavior**:
- Empty contexts list = all notes reviewed together
- All contexts inactive = all notes reviewed together
- At least one context active = only notes with active contexts are reviewed
- Notes without contexts are always included (for backward compatibility)

**Use cases**:
- Separate work and personal notes for focused review times
- Different contexts for different learning subjects
- Context-specific spacing methods (e.g., aggressive for language learning, relaxed for reference)

### Vault-wide Settings

**Timestamp timezone**: Choose how timestamps are stored
- **UTC**: Coordinated Universal Time (recommended for portability)
- **Local**: System timezone (more human-readable)

Note: Changing this only affects new timestamps. Existing timestamps remain in their current format.

### Logging

Control what review activity data is captured.

**Log file path**: Path to JSONL log file (leave empty to disable logging)
- Recommended extension: `.jsonl`
- Example: `SpacedEverything/activity.jsonl`

**Log note title**: Include note titles in logs (default: off for privacy)

**Log frontmatter properties**: Specify which properties to log
- Empty list `[]`: No frontmatter logged (most private)
- Wildcard `['*']`: All frontmatter logged
- Specific properties: `['tags', 'author']` logs only those

**Log onboard action**: Log when notes are added to the system

**Log remove action**: Log when notes are removed from the system

### Capture Thought

Configure quick note creation for fleeting thoughts.

**Note title template**: Template for new note titles
- Supports template variables (see below)
- Example: `"Thought - {{date}} {{time}}"`
- Default: `"Inbox {{unixtime}}"` (ensures unique filenames)

**Note directory**: Where to create captured thoughts
- Leave empty for vault root
- Example: `"Daily Notes/Thoughts"`

**New note template**: Initial content for captured thoughts
- Supports template variables
- Can include frontmatter, tags, or structure
- Default: `"## Captured thought\n{{thought}}"`

**Include short thought in alias**: Add brief thoughts as note aliases
- Makes them searchable via Obsidian's quick switcher
- Only applies to thoughts shorter than the threshold

**Short thought threshold**: Maximum length (in characters) for alias inclusion (default: 50)

**Open in new tab**: Open captured thoughts in new tab vs. current tab (default: true)

### Onboard All Notes (Beta)

Bulk vault-wide onboarding with folder exclusion.

**⚠️ Warning**: This modifies potentially hundreds or thousands of files. ALWAYS create a full vault backup before using.

**Excluded folders**: List folders to skip (one per line)
- Recommended: Template folders, script folders, archive folders
- Example: `Templates`, `Scripts`, `Archive`

**Behavior**:
- Adds spaced repetition frontmatter to all markdown files
- Skips files in excluded folders
- Preserves existing frontmatter (won't overwrite)
- Uses first spacing method configuration
- Doesn't assign contexts (notes remain context-free)

## Understanding SuperMemo 2.0

The SuperMemo 2.0 algorithm is a spaced repetition algorithm developed by Piotr Woźniak in 1987. It calculates optimal review intervals based on how well you recall information.

### How It Works

1. **Initial Review**: New notes start with a short interval (e.g., 1 day)

2. **Quality Rating**: After each review, you rate how productive it was (0-5 scale)
   - 0-2: Unproductive, made no progress
   - 3: Struggled but made some progress
   - 4: Good progress with effort
   - 5: Excellent progress, ideas flowing

3. **Interval Adjustment**: 
   - **Failed reviews (score < 3)**: Interval resets to minimum (typically 1 day)
   - **Successful reviews (score ≥ 3)**: Interval multiplies by ease factor

4. **Ease Factor Adjustment**: The ease factor personalizes the algorithm
   - Higher scores → increase ease factor → faster interval growth (material is easier for you)
   - Lower scores → decrease ease factor → slower interval growth (material is harder for you)
   - Minimum ease factor: 1.3 (algorithm constraint)

### Example Progression

```
Review 1: Rate 4 (Good) → Next review in 1 day
          Ease factor: 2.5

Review 2: Rate 5 (Perfect) → Next review in 2.5 days (1 × 2.5)
          Ease factor: 2.6 (increased slightly)

Review 3: Rate 4 (Good) → Next review in 6.5 days (2.5 × 2.6)
          Ease factor: 2.6 (stayed the same)

Review 4: Rate 2 (Failed) → Next review in 1 day (reset!)
          Ease factor: 2.38 (decreased)

Review 5: Rate 4 (Good) → Next review in 2.38 days (1 × 2.38)
          Ease factor: 2.38
```

### Why This Works for Writing

Unlike traditional flashcard review where you test memorization, Spaced Everything applies the algorithm to creative work:

- **Fruitful reviews** indicate notes where ideas are flowing → bring them back quickly
- **Unfruitful reviews** indicate notes that need more frequent attention → space them out more
- The algorithm adapts to your personal rhythm with each note

This creates a dynamic queue that surfaces notes at optimal times for productive engagement, neither too soon (wasting time) nor too late (losing momentum).

### Algorithm Constants

The SuperMemo 2.0 formula uses empirically-derived constants:

```
Ease adjustment = 0.1 - (5 - score) × (0.08 + (5 - score) × 0.02)
New ease = max(1.3, old ease + ease adjustment)
New interval = old interval × new ease (if score ≥ 3)
```

These constants were derived through extensive experimentation by Piotr Woźniak and represent optimal values for human memory and learning patterns.

## Frontmatter Properties

Spaced Everything adds the following frontmatter properties to onboarded notes:

### Core Properties

**`se-interval`** (number)
- Review interval in days
- Determines when the note is next due for review
- Grows with successful reviews, resets on failed reviews
- Example: `se-interval: 7`

**`se-last-reviewed`** (string)
- ISO 8601 timestamp of last review
- Used with `se-interval` to calculate due date
- Format: `YYYY-MM-DDTHH:MM:SS` (with optional timezone)
- Example: `se-last-reviewed: 2025-12-18T14:30:00Z`

**`se-ease`** (number)
- Ease factor for SuperMemo 2.0 algorithm
- Controls how quickly intervals grow (multiplier)
- Personalizes to your experience with each note
- Range: 1.3 to ~3.0 (typical)
- Example: `se-ease: 2.5`

### Optional Properties

**`se-contexts`** (string or array)
- Context(s) this note belongs to
- Can be single string or array for multiple contexts
- Only relevant if you've configured contexts
- Example:

```
se-contexts:
  - Learning
  - Reference
```

**`se-spacing-method`** (string)
- Override the spacing method for this specific note
- References a spacing method name from your settings
- If not specified, uses the default method or context's method
- Example: `se-spacing-method: "Aggressive Review"`

### Example Note Frontmatter

```yaml
---
se-interval: 7
se-last-reviewed: 2025-12-18T14:30:00Z
se-ease: 2.5
se-contexts:
  - Learning
title: SuperMemo 2.0 Algorithm Notes
tags: 
  - spaced-repetition
  - learning
---

# SuperMemo 2.0 Algorithm Notes

Content of your note...
```

### Manually Editing Properties

While the plugin manages these properties automatically, you can manually edit them:

- **Reset a note**: Set `se-interval: 1` to bring it back to the front of the queue
- **Pause a note**: Set `se-interval` to a very large number (e.g., 10000)
- **Adjust difficulty**: Modify `se-ease` (higher = easier, lower = harder)
- **Change context**: Edit `se-contexts` to move between contexts

**⚠️ Caution**: Manual edits can disrupt the algorithm's learning. Use sparingly and understand the implications.

## Template Variables

Template variables allow dynamic content in captured thought titles and note content.

### Available Variables

**`{{date}}`**
- Current date in YYYY-MM-DD format
- Example: `2025-12-18`
- Use for: Organizing notes by date

**`{{time}}`**
- Current time in HH:MM:SS format (24-hour)
- Example: `14:30:45`
- Use for: Timestamping within a day

**`{{unixtime}}`**
- Unix timestamp (milliseconds since January 1, 1970)
- Example: `1734520245123`
- Use for: Guaranteed unique filenames

**`{{thought}}`**
- The actual thought text you captured
- Only available in note content template (not title)
- Use for: Including the thought in the note body

### Template Examples

**Simple daily note**:
```
Title: "{{date}} - Thought"
Content: "{{thought}}"
```
Result: `2025-12-18 - Thought.md` containing your thought text

**Timestamped inbox**:
```
Title: "Inbox - {{date}} {{time}}"
Content: "# Captured {{date}} at {{time}}\n\n{{thought}}"
```
Result: `Inbox - 2025-12-18 14:30:45.md` with formatted content

**Guaranteed unique**:
```
Title: "{{unixtime}}"
Content: "{{thought}}"
```
Result: `1734520245123.md` - never conflicts with existing notes

**Structured thought**:
```
Title: "Thought - {{date}}"
Content: "# Quick Thought

{{thought}}

## Next Actions

- [ ] Review and expand
"
```

### Tips for Templates

- Use `{{unixtime}}` in titles to ensure uniqueness
- Combine `{{date}}` with descriptive text for browsability
- Include frontmatter in content templates for better organization
- Keep title templates short (Obsidian has filename length limits)
- Test templates before relying on them for important captures

## Advanced Usage

For power users who want to extend and customize Spaced Everything, see the [Advanced Usage Guide](docs/Advanced-Guide.md). This guide covers:

- **Visualizing Your Review Queue**: Create custom Dataview queries to see your entire review queue at once
- **Context Filtering**: Advanced filtering techniques for organizing reviews
- **Dashboard Integration**: Embed review queues in daily notes and dashboards
- **Troubleshooting**: Solutions to common query and integration issues

The Advanced Guide includes patterns and examples, with thanks to [@menkaru](https://github.com/menkaru) for the initial Dataview query contribution.

## Future Development

Possible future development:
- Implement other spacing algorithms (enabling distinct spacing algorithms per each context)
- Enable users to create their own custom spacing algorithm scripts to extend to a deeper level of control in the spacing behavior
- More flexible context filtering (AND logic, exclusion rules)
- Statistics and analytics dashboard
- Export/import of review history
- Integration with daily notes and periodic notes plugins

## Support

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/zachmueller/spaced-everything/issues)
- **Discussions**: Join the conversation on [GitHub Discussions](https://github.com/zachmueller/spaced-everything/discussions)
- **Support Development**: [Buy me a coffee](https://buymeacoffee.com/zachmueller)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- **Andy Matuschak** for the Spaced Writing Practice concept and inspiration
- **Piotr Woźniak** for developing the SuperMemo 2.0 algorithm
- The Obsidian community for feedback and support
