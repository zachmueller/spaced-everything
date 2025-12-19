# Bases Query Guide

This guide covers advanced customization using Obsidian's built-in Bases functionality for power users of Spaced Everything. For basic setup and usage, refer to the main [README](../README.md).

> **Alternative Approach:** If you prefer a plugin-based solution with more query flexibility, see the [Dataview Query Guide](./Dataview-queries.md) which achieves similar functionality using the Dataview plugin. Both approaches are valid - Bases is built-in and UI-based, while Dataview offers more advanced querying capabilities.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Visualizing Your Review Queue with Bases](#visualizing-your-review-queue-with-bases)
  - [Understanding the Plugin's Queue Logic](#understanding-the-plugins-queue-logic)
  - [Creating Your First Base](#creating-your-first-base)
  - [Basic Review Queue Query](#basic-review-queue-query)
  - [Filtered Queue by Context](#filtered-queue-by-context)
  - [Advanced Customizations](#advanced-customizations)
- [Query Structure Reference](#query-structure-reference)
- [Troubleshooting](#troubleshooting)
- [Integration Ideas](#integration-ideas)
- [Contributing](#contributing)

## Prerequisites

### Obsidian Bases

Bases is Obsidian's built-in database functionality introduced in recent versions. Unlike Dataview, **no plugin installation is required** - Bases comes with Obsidian by default.

**Accessing Bases:**
1. Open the left sidebar in Obsidian
2. Click the **Bases** icon (database/table icon)
3. Create a new Base or open an existing one

**Learning Bases:**
- [Obsidian Bases Documentation](https://help.obsidian.md/bases)
- Bases uses a JSON-like query structure with filters, formulas, and views
- Bases automatically indexes your vault's properties (frontmatter)

## Visualizing Your Review Queue with Bases

While Spaced Everything's "Open next item for review" command shows one note at a time, you might want to visualize your entire review queue. Bases queries can replicate the plugin's queue logic, letting you see all upcoming reviews at once.

### Understanding the Plugin's Queue Logic

The plugin determines which notes to review using this logic:

1. **Calculate due date**: Add `se-interval` (in days) to `se-last-reviewed` timestamp
2. **Filter overdue**: Keep only notes where due date ≤ current date
3. **Filter by context**: If contexts are active, include only matching notes
4. **Sort by urgency**: Order by due date (oldest first)

The queries below replicate this logic visually.

### Creating Your First Base

**To create a new Base for your review queue:**

1. Click the **Bases** icon in the left sidebar
2. Click **New Base**
3. Name it "Review Queue" (or your preferred name)
4. Switch to **Source** view (JSON icon in top-right)
5. Replace the default query with one of the examples below
6. Switch back to **Table** view to see the results

### Basic Review Queue Query

This query shows all notes currently due for review, regardless of context.

```base
filters:
  and:
    - file.hasProperty('se-interval')
    - file.hasProperty('se-last-reviewed')
formulas:
  due_date: date(note["se-last-reviewed"]) + duration((note["se-interval"]*24*60*60).round(0) + "s")
  is_due: if(formula.due_date<=now(), True, False)
properties:
  formula.due_date:
    displayName: Due Date
  note.se-last-reviewed:
    displayName: Last Reviewed
  note.se-interval:
    displayName: Interval (Days)
  file.name:
    displayName: Note
views:
  - type: table
    name: Current Review Queue
    filters:
      and:
        - formula.is_due == True
    order:
      - file.name
      - formula.due_date
      - formula.is_due
    sort:
      - property: formula.due_date
        direction: ASC
    limit: 50
```

**How it works:**
- **filters**: Only includes notes with both `se-interval` and `se-last-reviewed` properties
- **formulas.due_date**: Calculates when the note is next due by adding interval (converted to seconds) to last reviewed date
- **formulas.is_due**: Boolean check if the note is currently overdue using an if statement
- **properties**: Defines which properties to display and their labels
- **views.filters**: Filters the table view to only show notes where `is_due == True`
- **views.sort**: Orders by due date, oldest first (most urgent)
- **views.limit**: Restricts to showing top 50 results

**Example output:**

| Note | Last Reviewed | Interval (Days) | Due Date |
|------|---------------|-----------------|----------|
| Meeting Notes | 2025-12-11T09:30:00 | 5 | 2025-12-16T09:30:00 |
| Project Ideas | 2025-12-10T14:00:00 | 7 | 2025-12-17T14:00:00 |
| Research Paper | 2025-12-15T16:45:00 | 2 | 2025-12-17T16:45:00 |

### Filtered Queue by Context

Filter your review queue to specific contexts (e.g., "work", "personal", "learning"). Modify the view filters to include context checks:

**Single or multiple contexts (OR logic):**
```base
views:
  - type: table
    name: Work or Personal Queue
    filters:
      and:
        - formula.is_due == True
        - or:
          - note["se-contexts"].containsAny("work", "personal")
```

**Multiple contexts (AND logic - note must have both):**
```base
views:
  - type: table
    name: Work AND Learning Queue
    filters:
      and:
        - formula.is_due == True
        - note["se-contexts"].contains("work")
        - note["se-contexts"].contains("learning")
```

**Exclude a context:**
```base
views:
  - type: table
    name: Non-Archive Queue
    filters:
      and:
        - formula.is_due == True
        - not:
          - note["se-contexts"].contains("archive")
```

**Using containsAny for multiple contexts:**
```base
views:
  - type: table
    name: Multi-Context Queue
    filters:
      and:
        - formula.is_due == True
        - note["se-contexts"].containsAny("work", "personal", "learning")
```

**Notes:**
- Context names are case-sensitive: `"work"` ≠ `"Work"`
- Use `note["se-contexts"]` to access the property
- The `.containsAny()` method works with array properties

### Advanced Customizations

#### Show Multiple Contexts

Add the contexts property to your properties list:

```base
properties:
  note.se-contexts:
    displayName: Contexts
```

Bases will automatically display array properties as comma-separated values.

#### Multiple Views in One Base

Create different views for different purposes within a single Base:

```base
views:
  - type: table
    name: Overdue Now
    filters:
      and:
        - formula.is_due == True
    sort:
      - property: formula.due_date
        direction: ASC
    limit: 50
  
  - type: table
    name: Next 7 Days
    filters:
      and:
        - formula.due_date <= date(now) + duration("7d")
    sort:
      - property: formula.due_date
        direction: ASC
    limit: 50
  
  - type: table
    name: Work Context Only
    filters:
      and:
        - formula.is_due == True
        - note["se-contexts"].contains("work")
    sort:
      - property: formula.due_date
        direction: ASC
    limit: 25
```

Switch between views using the dropdown at the top of the Base.

#### Display Ease Factor

Show the ease factor alongside other properties:

```base
properties:
  note.se-ease:
    displayName: Ease Factor
```

Then add it to your view's order if desired:

```base
views:
  - type: table
    name: Review Queue
    order:
      - file.name
      - formula.due_date
      - note.se-ease
```

## Query Structure Reference

### Base Query Anatomy

```base
filters:                    # Top-level filters for which notes to include
  and:                      # Logical operators: and, or, not
    - file.hasProperty('property-name')
    
formulas:                   # Computed fields
  formula_name: expression  # Formula expressions using note properties
  
properties:                 # Which properties to display
  note.property-name:       # Access note frontmatter properties
    displayName: "Label"
  formula.formula_name:     # Access computed formulas
    displayName: "Label"
  file.name:                # Access file metadata
    displayName: "Label"
    
views:                      # Display configurations
  - type: table             # View type (currently only table)
    name: "View Name"       # Name shown in dropdown
    filters:                # View-specific filters
      and:
        - condition
    order:                  # Which columns to show (in order)
      - property.name
    sort:                   # Sort configuration
      - property: property.name
        direction: ASC      # ASC or DESC
    limit: 50               # Maximum rows to display
```

### Common Property Accessors

- `file.name` - File name (without extension)
- `file.path` - Full file path
- `file.hasProperty('name')` - Check if property exists
- `note["property-name"]` - Access frontmatter property
- `formula.formula_name` - Access computed formula

### Useful Formula Functions

- `date(value)` - Convert to date
- `duration("Nd")` - Create duration (N days, use "h" for hours, "s" for seconds)
- `date(now)` - Current date/time
- `.round(decimals)` - Round number
- `.days()` - Convert duration to days
- `.contains(value)` - Check if array contains value
- `.containsAny(v1, v2, ...)` - Check if array contains any of the values

## Troubleshooting

### Query Returns No Results

**Possible causes:**

1. **No notes are onboarded yet**
   - Solution: Onboard notes using `Spaced Everything: Log review outcome`
   - Check: Look for notes with `se-interval` frontmatter property

2. **No notes are currently due**
   - Solution: Remove or adjust the `is_due` filter in the view
   - Test: Create a view without the `formula.is_due == True` filter to see all tracked notes

3. **Bases isn't indexing your properties**
   - Solution: Close and reopen the Base
   - Check: Settings → Files & Links → ensure frontmatter properties are detected

### Context Filter Not Working

**Possible causes:**

1. **Case sensitivity mismatch**
   - Check: Context names are case-sensitive
   - Example: `"work"` in query vs. `"Work"` in frontmatter won't match

2. **Property name typo**
   - Check: Use `note["se-contexts"]` (with square brackets and quotes)
   - Verify: Open a note and check the exact property name

3. **Wrong method for checking array**
   - Solution: Use `.contains("value")` or `.containsAny("val1", "val2")`
   - Don't use: `= "value"` (equality doesn't work for arrays)

### Formula Errors

**Possible causes:**

1. **Duration format incorrect**
   - Check: Use `duration("7d")` not `duration(7d)` or `duration(7 days)`
   - Formats: `"Nd"` for days, `"Nh"` for hours, `"Ns"` for seconds

2. **Property access syntax**
   - Check: Use `note["property-name"]` with square brackets and quotes
   - Don't use: `note.property-name` (dot notation doesn't work in Bases)

3. **Type mismatches**
   - Solution: Ensure dates are wrapped in `date()` function
   - Solution: Convert intervals to seconds: `note["se-interval"]*24*60*60`

### Base Shows Wrong Data

**Possible causes:**

1. **Cache is stale**
   - Solution: Close and reopen the Base
   - Alternative: Restart Obsidian

2. **Multiple views showing different filters**
   - Check: Ensure you're looking at the correct view (dropdown at top)
   - Each view can have its own filters and sort order

## Integration Ideas

### Multiple Bases for Different Workflows

Create specialized Bases for different review patterns:

**1. Daily Review Base**
- View 1: Overdue items only (top 10)
- View 2: Due today (all)
- View 3: Quick wins (ease factor > 2.5)

**2. Context-Specific Base**
- View 1: Work context
- View 2: Personal context
- View 3: Learning context

**3. Analysis Base**
- View 1: All tracked notes (no due filter)
- View 2: Recently reviewed (last 7 days)
- View 3: Never reviewed (high intervals)

### Dashboard Integration

While Bases can't be embedded in notes directly, you can:

1. Pin your Review Queue Base to the sidebar
2. Create a note with links to specific Base views
3. Use Bases as a companion to your daily note workflow

### Weekly Review Workflow

Create a "Weekly Review" Base with views:

1. **Completed This Week**: Filter to `se-last-reviewed >= date(now) - duration("7d")`
2. **Coming Up**: Filter to `due_date <= date(now) + duration("7d")`
3. **Neglected Notes**: Filter to `se-interval > 30` (notes reviewed infrequently)

### Statistics Views

Add formulas to track review statistics:

```base
formulas:
  total_reviews: note["se-review-count"] ?? 0
  avg_ease: note["se-ease"] ?? 2.5
  days_tracked: (date(now) - date(note["se-last-reviewed"])).days().round(0)
```

Create views grouped by different metrics to analyze your review patterns.

## Contributing

This Bases query guide was developed based on community patterns from the Dataview query guide. As Bases continues to evolve, new patterns and optimizations will emerge.

**Share your own patterns:**
- Post queries in [GitHub Discussions](https://github.com/zachmueller/spaced-everything/discussions)
- Submit improvements via pull requests
- Report issues with queries on [GitHub Issues](https://github.com/zachmueller/spaced-everything/issues)

**Ideas for future contributions:**
- Advanced formula patterns for analytics
- Integration patterns with Obsidian's canvas
- Performance optimization techniques for large vaults
- Migration guides from Dataview to Bases

---

**Comparison with Dataview:**
- **Bases**: Built-in, no plugin required, UI-based editing, limited to tables
- **Dataview**: Plugin-required, code-based, more query types, mature ecosystem

Both approaches are valid - choose based on your comfort level and needs. See [Dataview-queries.md](./Dataview-queries.md) for Dataview patterns.
